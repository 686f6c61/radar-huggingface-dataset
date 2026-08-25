# XingHan-WANG/meshtailor-v13paper100k

## Resumen

MeshTailor es un framework generativo nativo de mallas para sintetizar costuras alineadas con bordes en superficies 3D, presentado en el artículo "MeshTailor: Cutting Seams via Generative Mesh Traversal" (arXiv:2603.27309). Este checkpoint concreto, `XingHan-WANG/meshtailor-v13paper100k`, es una reproducción del mejor modelo del artículo, entrenada sobre 100 000 prendas del dataset GarmentCodeDataset con etiquetas "maximal chain" (versión v13) y el protocolo de secuencia descrito en el paper. El modelo resuelve el problema de colocar costuras de forma coherente y alineada con la topología de la malla, evitando artefactos de proyección y heurísticas frágiles de ajuste. Su relevancia radica en ser el primer enfoque que opera directamente sobre el grafo de la malla mediante un Pointer Network con conciencia geométrica, lo que mejora la coherencia de las costuras y reduce la fragmentación frente a métodos previos. El checkpoint pesa aproximadamente 1,14 GB e incluye pesos, estado del optimizador y configuración, pero no se especifica el número total de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pointer Network con conciencia geometrica, recorrido autoregresivo del grafo de malla (mesh-native) |
| Parametros totales | no disponible (checkpoint de ~1,14 GB, sin desglose) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (opera sobre grafos de malla, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (se recomienda bf16 para inferencia en GPUs modernas) |
| Idiomas soportados | no aplicable (modelo de generacion de mallas, no de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) con state dict, estado del optimizador y configuracion |

## Arquitectura y entrenamiento

El modelo se basa en un Pointer Network que recorre el grafo de la malla de forma autoregresiva. En lugar de trabajar con proyecciones 2D o representaciones extrínsecas, MeshTailor restringe el espacio de decisión al vecindario de 1-anillo de cada vértice, lo que permite trazar secuencias de vértices paso a paso y generar costuras alineadas con las aristas. Introduce además ChainingSeams, una serialización jerárquica del grafo de costuras que ordena las secuencias para facilitar el aprendizaje. El entrenamiento se realizó sobre 100 000 prendas de GarmentCodeDataset, con etiquetas "maximal chain" (relabel v13) y el protocolo de secuencia del artículo. No se dispone de información sobre el número de tokens, composición del dataset ni uso de técnicas como RLHF o DPO.

## Capacidades

- Generacion de costuras (seams) alineadas con aristas en mallas 3D de prendas.
- Prediccion de bordes de costura mediante recorrido autoregresivo del grafo de malla.
- Serializacion jerarquica del grafo de costuras (ChainingSeams) para ordenar secuencias.
- Operacion nativa sobre topologia de malla, sin proyeccion a 2D ni artefactos de proyeccion.
- Inferencia con configuracion recomendada de temperatura 0.1 y sin penalizaciones.
- Soporte de precision bf16 para GPUs modernas.

## Casos de uso

- Diseño de patrones de costura en moda 3D: el modelo genera costuras coherentes sobre mallas de prendas, lo que permite a disenadores obtener lineas de corte listas para patronaje sin ajuste manual.
- Simulacion de telas y animacion: las costuras generadas pueden usarse como restricciones en simuladores fisicos de tela, mejorando el comportamiento de la prenda en movimiento.
- Preparacion de mallas para impresion 3D: al predecir costuras, se facilita la segmentacion de la malla en piezas planas para fabricacion aditiva.
- Generacion de variantes de diseno: partiendo de una malla base, el modelo puede producir diferentes configuraciones de costura, explorando alternativas de diseno rapidamente.
- Integracion en pipelines de modelado procedural: el checkpoint puede cargarse en un pipeline de generacion de prendas para automatizar la etapa de costura, reduciendo intervencion manual.
- Investigacion en generacion de mallas: sirve como punto de partida para estudiar metodos de recorrido de grafos aplicados a geometria 3D, dado que es una reproduccion del articulo original.

## Benchmarks y rendimiento

Segun la model card, sobre un conjunto de prueba de 10 000 prendas se obtuvieron los siguientes resultados:

| Metrica | Valor |
|---|---|
| Macro edge recall | 0.846 |
| Precision | 0.931 |
| Chart count | 0.88 × GT |
| Area mean \|r−1\| | 1.06 × GT |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- No se especifica VRAM estimada para inferencia en la informacion disponible.
- Se recomienda el uso de GPUs modernas con soporte bf16 (por ejemplo, RTX 3090, RTX 4090, A100, H100).
- Dado el tamano del checkpoint (~1,14 GB), es probable que quepa en GPUs de consumo con al menos 8 GB de VRAM, pero no hay datos confirmados.
- Opciones de despliegue: el checkpoint se carga con PyTorch (`torch.load` con `weights_only=False`) y requiere el codigo del repositorio companion de MeshTailor para la inferencia completa.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se recomienda consultar el articulo original para una comparativa con metodos previos de colocacion de costuras.

## Limitaciones y advertencias

- Es un checkpoint de reproduccion, no el modelo oficial del articulo; puede haber diferencias sutiles con el original.
- La carga del checkpoint requiere `weights_only=False` porque contiene objetos no tensoriales (estado del optimizador y configuracion), lo que implica un riesgo de seguridad si el archivo proviene de una fuente no confiable.
- Los derechos del dataset GarmentCodeDataset pertenecen a sus autores; la licencia MIT solo cubre el codigo, no los datos.
- No se han documentado sesgos especificos, pero al entrenarse exclusivamente con prendas de GarmentCodeDataset, el modelo puede no generalizar bien a otros tipos de mallas o dominios.
- No hay informacion sobre alucinaciones o errores en la generacion de costuras fuera de las metricas reportadas.
- Para uso en produccion, se recomienda validar las costuras generadas con criterios de diseno y fisica, ya que el modelo no garantiza la viabilidad de las piezas resultantes.

## Enlaces

- HuggingFace: https://huggingface.co/XingHan-WANG/meshtailor-v13paper100k
- Pagina del proyecto: https://meshtailor.github.io/
- Articulo arXiv (HTML): https://arxiv.org/html/2603.27309v2
- Articulo arXiv (PDF): https://arxiv.org/pdf/2603.27309
- Resumen en ChatPaper: https://chatpaper.com/paper/262884
- Repositorio GitHub de la pagina: https://github.com/MeshTailor/meshtailor.github.io
