import QuadEdge from './QuadEdge';
import CGAlgorithms from '../../algorithm/CGAlgorithms';
import GeometryFactory from '../../geom/GeometryFactory';
import Coordinate from '../../geom/Coordinate';
import Vertex from './Vertex';
import ArrayList from '../../../../../java/util/ArrayList';
import TriangleVisitor from './TriangleVisitor';
export default class QuadEdgeTriangle {
	constructor(...args) {
		this.edge = null;
		this.data = null;
		if (args.length === 1) {
			let [edge] = args;
			this.edge = edge.clone();
			for (var i = 0; i < 3; i++) {
				edge[i].setData(this);
			}
		}
	}
	get interfaces_() {
		return [];
	}
	static get QuadEdgeTriangleBuilderVisitor() {
		return QuadEdgeTriangleBuilderVisitor;
	}
	static toPolygon(...args) {
		if (args.length === 1) {
			if (args[0] instanceof Array) {
				let [v] = args;
				var ringPts = [v[0].getCoordinate(), v[1].getCoordinate(), v[2].getCoordinate(), v[0].getCoordinate()];
				var fact = new GeometryFactory();
				var ring = fact.createLinearRing(ringPts);
				var tri = fact.createPolygon(ring, null);
				return tri;
			} else if (args[0] instanceof Array) {
				let [e] = args;
				var ringPts = [e[0].orig().getCoordinate(), e[1].orig().getCoordinate(), e[2].orig().getCoordinate(), e[0].orig().getCoordinate()];
				var fact = new GeometryFactory();
				var ring = fact.createLinearRing(ringPts);
				var tri = fact.createPolygon(ring, null);
				return tri;
			}
		}
	}
	static nextIndex(index) {
		return index = (index + 1) % 3;
	}
	static contains(...args) {
		if (args.length === 2) {
			if (args[0] instanceof Array && args[1] instanceof Coordinate) {
				let [tri, pt] = args;
				var ring = [tri[0].getCoordinate(), tri[1].getCoordinate(), tri[2].getCoordinate(), tri[0].getCoordinate()];
				return CGAlgorithms.isPointInRing(pt, ring);
			} else if (args[0] instanceof Array && args[1] instanceof Coordinate) {
				let [tri, pt] = args;
				var ring = [tri[0].orig().getCoordinate(), tri[1].orig().getCoordinate(), tri[2].orig().getCoordinate(), tri[0].orig().getCoordinate()];
				return CGAlgorithms.isPointInRing(pt, ring);
			}
		}
	}
	static createOn(subdiv) {
		var visitor = new QuadEdgeTriangleBuilderVisitor();
		subdiv.visitTriangles(visitor, false);
		return visitor.getTriangles();
	}
	getCoordinates() {
		var pts = new Array(4);
		for (var i = 0; i < 3; i++) {
			pts[i] = this.edge[i].orig().getCoordinate();
		}
		pts[3] = new Coordinate(pts[0]);
		return pts;
	}
	getVertex(i) {
		return this.edge[i].orig();
	}
	isBorder(...args) {
		if (args.length === 0) {
			let [] = args;
			for (var i = 0; i < 3; i++) {
				if (this.getAdjacentTriangleAcrossEdge(i) === null) return true;
			}
			return false;
		} else if (args.length === 1) {
			let [i] = args;
			return this.getAdjacentTriangleAcrossEdge(i) === null;
		}
	}
	getEdgeIndex(...args) {
		if (args.length === 1) {
			if (args[0] instanceof QuadEdge) {
				let [e] = args;
				for (var i = 0; i < 3; i++) {
					if (this.edge[i] === e) return i;
				}
				return -1;
			} else if (args[0] instanceof Vertex) {
				let [v] = args;
				for (var i = 0; i < 3; i++) {
					if (this.edge[i].orig() === v) return i;
				}
				return -1;
			}
		}
	}
	getGeometry(fact) {
		var ring = fact.createLinearRing(this.getCoordinates());
		var tri = fact.createPolygon(ring, null);
		return tri;
	}
	getCoordinate(i) {
		return this.edge[i].orig().getCoordinate();
	}
	getTrianglesAdjacentToVertex(vertexIndex) {
		var adjTris = new ArrayList();
		var start = this.getEdge(vertexIndex);
		var qe = start;
		do {
			var adjTri = qe.getData();
			if (adjTri !== null) {
				adjTris.add(adjTri);
			}
			qe = qe.oNext();
		} while (qe !== start);
		return adjTris;
	}
	getNeighbours() {
		var neigh = new Array(3);
		for (var i = 0; i < 3; i++) {
			neigh[i] = this.getEdge(i).sym().getData();
		}
		return neigh;
	}
	getAdjacentTriangleAcrossEdge(edgeIndex) {
		return this.getEdge(edgeIndex).sym().getData();
	}
	setData(data) {
		this.data = data;
	}
	getData() {
		return this.data;
	}
	getAdjacentTriangleEdgeIndex(i) {
		return this.getAdjacentTriangleAcrossEdge(i).getEdgeIndex(this.getEdge(i).sym());
	}
	getVertices() {
		var vert = new Array(3);
		for (var i = 0; i < 3; i++) {
			vert[i] = this.getVertex(i);
		}
		return vert;
	}
	getEdges() {
		return this.edge;
	}
	getEdge(i) {
		return this.edge[i];
	}
	toString() {
		return this.getGeometry(new GeometryFactory()).toString();
	}
	isLive() {
		return this.edge !== null;
	}
	kill() {
		this.edge = null;
	}
	contains(pt) {
		var ring = this.getCoordinates();
		return CGAlgorithms.isPointInRing(pt, ring);
	}
	getEdgeSegment(i, seg) {
		seg.p0 = this.edge[i].orig().getCoordinate();
		var nexti = (i + 1) % 3;
		seg.p1 = this.edge[nexti].orig().getCoordinate();
	}
	getClass() {
		return QuadEdgeTriangle;
	}
}
class QuadEdgeTriangleBuilderVisitor {
	constructor(...args) {
		this.triangles = new ArrayList();
		if (args.length === 0) {
			let [] = args;
		}
	}
	get interfaces_() {
		return [TriangleVisitor];
	}
	visit(edges) {
		this.triangles.add(new QuadEdgeTriangle(edges));
	}
	getTriangles() {
		return this.triangles;
	}
	getClass() {
		return QuadEdgeTriangleBuilderVisitor;
	}
}
