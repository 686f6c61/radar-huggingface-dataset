# wiltodelta/raiw-source-classify

## Resumen

RAIW multi-provider source-pipeline classifier (`multi-provider-source-v3`) es un clasificador forense de imagenes desarrollado por wiltodelta que atribuye una imagen a la familia de proveedor de IA que la genero. A diferencia de otros detectores, no es un detector de marcas de agua criptograficas como SynthID: sus etiquetas describen la pipeline completa de generacion y exportacion de pixeles (renderizador, geometria, codificacion, postprocesado y estado de marca de agua), por lo que estos factores pueden confundirse entre si.

El modelo se distribuye como un artefacto NumPy (`multi-provider-source-v3.npz`) libre de pickle (`allow_pickle=False`), de 1,8 GB, y opera en dos etapas: una primera fase de especialistas por proveedor y subfamilia con routers de margen competitivo, y una segunda fase de cabezas de version apiladas sobre 1.376 dimensiones de caracteristicas. Cubre 10 familias de proveedores (openai, google, bytedance, flux, stable_diffusion, meta, midjourney, ideogram, firefly y xai) mas una clase `unknown` para imagenes que no clasifica.

Su relevancia actual radica en el contexto de atribucion forense de contenido sintetico: permite distinguir con alta especificidad imagenes reales de imagenes generadas por IA, y entre estas ultimas estimar el proveedor y la subfamilia de version. La evaluacion reportada sobre 90.079 muestras auditadas, con 10.586 en test bloqueado, muestra una especificidad de `unknown` del 99,52% y una precision global del 96,62% cuando el modelo emite una prediccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble hibrido en dos etapas: Stage 1 con 54 unidades especialistas primarias (MLP Soup block-diagonal, HistGradientBoosting y ExtraTrees destilado a MLP) y 366 descriptores auxiliares hinge; router meta zero-inflated de 2 nudos; Stage 2 con 9 cabezas de version apiladas sobre 1376-d (HistGradientBoosting) |
| Parametros totales | no disponible (artefacto `.npz` de 1,8 GB de parametros aprendidos, constantes de normalizacion, arboles y umbrales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagen, entrada fija de 956 dimensiones) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el artefacto se distribuye en precision nativa) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.npz` NumPy con `allow_pickle=False` (SHA-256: `9cc657037074e79e964ba446e169591e3dda781e927674df55daf9c227d2bc6b`) |

## Arquitectura y entrenamiento

La entrada del modelo es un vector de 956 dimensiones compuesto por tres bloques: 124 dimensiones de caracteristicas forenses espaciales de residuo oponente y gradiente (`extract_124d`), 768 dimensiones de caracteristicas espectrales de log-potencia y radiales sin fase en parches de 16x16 (`source_spectral`), y 64 dimensiones de caracteristicas direccionales, de frontera de bloque (8x8 y 16x16), de aliasing cromatico y de anisotropia azimutal (`augment_892d_to_956d`).

La Stage 1 combina 10 especialistas globales de proveedor y 44 especialistas de subfamilia y regimen de codec/exportacion (37 activos), cada uno integrando un MLP Soup block-diagonal (incluyendo bloques de tronco compartido multi-tarea de 3 semillas), un ensemble de arboles HistGradientBoosting vectorizado de profundidad fija y un estudiante destilado ExtraTrees a MLP con pesos de mezcla recalibrados (`w_e <= 0.25`). Estos se agrupan mediante blending zero-inflated de subfamilia acotado por deriva sobre 16 variedades de imagen real, refinados por un meta-router hinge zero-inflated de 2 nudos y enrutados por un margen competitivo amortiguado (`gamma = 0.60`). La Stage 2 usa 9 cabezas de version apiladas que reciben las 956 dimensiones mas los log-odds de las unidades de Stage 1 para predecir la subfamilia canonica de modelo/exportacion. El artefacto solo contiene parametros aprendidos, constantes de normalizacion, arreglos de arboles, etiquetas y umbrales calibrados; no contiene imagenes de entrenamiento, rutas, hashes ni catalogo de entrenamiento.

El punto de operacion se selecciono sobre un split de calibracion disjunto de 8.365 imagenes a traves de 16 variedades finas de imagen real y vistas nativas, JPEG ligero y JPEG pesado/redimensionado bloqueadas por grupo (`parent_sha256`). El conjunto auditado total es de 90.079 muestras limpias, con 10.586 en el test bloqueado (4.539 negativos `unknown` multi-variedad y 6.047 imagenes de proveedor IA incluyendo derivados sociales/JPEG preprocesados).

## Capacidades

- Clasificacion de atribucion de fuente de imagen entre 10 familias de proveedor de IA mas clase `unknown` de absteccion.
- Deteccion de imagenes generadas por IA con especificidad alta sobre imagenes reales (99,52% de especificidad `unknown` en test bloqueado).
- Prediccion de subfamilia de version/modelo dentro de cada proveedor mediante Stage 2 (9 cabezas de version).
- Discriminacion de regimen de codec y exportacion (vistas nativas, JPEG ligero, JPEG pesado/redimensionado) mediante especialistas de codec/exportacion.
- Veto de dominio real para evitar falsos positivos en variedades no fotograficas (documentos, diagramas, graficos, artefactos vectoriales, recibos, etc.).
- Capacidad de absteccion calibrada: el modelo puede devolver `unknown` en lugar de forzar una etiqueta de proveedor.
- No decodifica ni verifica cargas de marcas de agua criptograficas o invisibles (`watermark_truth="unknown"`); no es un detector de SynthID.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de texto, audio o vision general: es un clasificador de caracteristicas de pixel con entrada fija.

## Casos de uso

- Moderacion de contenido en plataformas: integrar el clasificador en pipelines de subida de imagen para marcar contenido sintetico y estimar el proveedor de origen, aprovechando la alta especificidad `unknown` (0,48% de FPR en test) para no penalizar imagenes reales.
- Verificacion periodistica y fact-checking: adjuntar una etiqueta de atribucion de pipeline (proveedor y subfamilia de version) a imagenes recibidas, con la salvedad explicita de que la etiqueta no prueba la presencia de SynthID ni de marcas de agua.
- Analisis forense de campanas de desinformacion: agrupar lotes de imagenes por proveedor y subfamilia de exportacion para identificar clusters de generacion y diferenciar derivados recompresados de originales nativos.
- Investigacion academica sobre procedencia de contenido: usar las caracteristicas espectrales y forenses de 956 dimensiones como base reproducible para estudios de atribucion, dado que el artefacto es libre de pickle y auditable con NumPy.
- Deteccion de derivados en redes sociales: aplicar el modelo a imagenes que han pasado por recompresion JPEG y redimensionado, donde los especialistas de codec/exportacion estan disenados para operar, aunque con recall reducido (22,39% en vistas recompresadas frente a 63,43% en nativas).
- Cumplimiento normativo y trazabilidad de activos: etiquetar catalogos de imagenes con proveedor y version estimados para auditorias de procedencia, aceptando la tasa de absteccion como mecanismo de seguridad ante falsos positivos.
- Triaje previo a peritaje manual: usar el score de confianza monotono (`_sigmoid_scalar(excess[best_cls])`) como priorizador para que analistas humanos revisen primero las imagenes con mayor probabilidad de ser sinteticas.

## Benchmarks y rendimiento

Evaluacion sobre 10.586 imagenes de test bloqueado (4.539 negativos `unknown` + 6.047 imagenes de proveedor IA):

| Metrica | Valor |
|---|---|
| Especificidad `unknown` (router 10 proveedores) | 99,52% |
| FPR `unknown` en test | 0,48% |
| FPR fotografico | 0,69% |
| FPR no fotografico estructurado (15 variedades) | 0,30% |
| Recall agregado objetivo | 56,67% |
| Recall en vistas nativas | 63,43% |
| Recall en vistas recompresadas | 22,39% |
| Precision de proveedor entre IA clasificada | 97,22% |
| Precision global al emitir prediccion | 96,62% |
| ROC-AUC binario | 0,9514 |
| PR-AUC binario | 0,9640 |

Rendimiento por proveedor:

| Proveedor | Test count | ROC AUC standalone | Recall router | Precision router | Precision version Stage 2 |
|---|---:|---:|---:|---:|---:|
| `openai` | 1.478 | 0,9693 | 67,8% | 97,0% | 86,5% |
| `google` | 1.382 | 0,9713 | 68,5% | 96,4% | 93,2% |
| `bytedance` | 389 | 0,9565 | 59,1% | 99,6% | 90,0% |
| `flux` | 1.357 | 0,9309 | 40,6% | 96,3% | 87,0% |
| `stable_diffusion` | 955 | 0,9640 | 49,4% | 96,7% | 86,8% |
| `meta` | 94 | 0,9797 | 78,7% | 96,1% | no disponible (`meta:imagine`) |
| `midjourney` | 123 | 0,9565 | 45,5% | 94,9% | 90,2% |
| `ideogram` | 118 | 0,9307 | 30,5% | 94,7% | 65,3% |
| `firefly` | 103 | 0,9193 | 46,6% | 87,3% | 100,0% |
| `xai` | 48 | 0,9416 | 25,0% | 92,3% | 72,9% |

Especificidad por variedad de imagen real (4.539 negativos de test):

| Variedad | Test count | Falsos positivos | FPR | Especificidad |
|---|---:|---:|---:|---:|
| `photo` | 2.183 | 15 | 0,69% | 99,31% |
| `photo_retouched` | 339 | 1 | 0,29% | 99,71% |
| `classical_inpaint` | 17 | 0 | 0,00% | 100,00% |
| `digital_art` | 441 | 1 | 0,23% | 99,77% |
| `game_art` | 174 | 0 | 0,00% | 100,00% |
| `vector` | 135 | 1 | 0,74% | 99,26% |
| `interface` | 180 | 0 | 0,00% | 100,00% |
| `diagram` | 98 | 1 | 1,02% | 98,98% |
| `chart_data_viz` | 159 | 0 | 0,00% | 100,00% |
| `technical_architecture` | 84 | 0 | 0,00% | 100,00% |
| `procedural_graphic` | 13 | 0 | 0,00% | 100,00% |
| `document` | 165 | 0 | 0,00% | 100,00% |
| `gov_scientific_doc` | 32 | 0 | 0,00% | 100,00% |
| `receipt_invoice` | 181 | 0 | 0,00% | 100,00% |
| `print_publishing` | 229 | 1 | 0,44% | 99,56% |
| `stress_recompressed` | 103 | 2 | 1,94% | 98,06% |
| `foreign_ai` | 6 | 0 | 0,00% | 100,00% |

No se han publicado resultados de benchmarks estandar de vision (ImageNet, etc.) en la informacion disponible; los datos anteriores son la evaluacion propia del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el artefacto pesa 1,8 GB y se carga en memoria del proceso, por lo que se estima un consumo de RAM/VRAM en el rango de 2 a 4 GB incluyendo buffers de caracteristicas, aunque esta cifra no esta confirmada por el autor.
- GPU recomendadas: no disponible; al ser un ensemble de arboles y MLPs con NumPy, no requiere GPU dedicada y puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no requiere GPU; cualquier equipo con al menos ~2 GB de RAM libre podria ejecutarlo en CPU, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: al usar `library_name: numpy` y un artefacto `.npz`, el despliegue se realiza cargando el archivo con NumPy (`allow_pickle=False`) dentro del pipeline `remove-ai-watermarks` (`classify_source` / `remove-ai-watermarks classify-source`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La comparativa con alternativas de atribucion forense de fuente de imagen (detectores de SynthID, clasificadores de procedencia de difusion) no esta disponible en los datos facilitados.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wiltodelta/raiw-source-classify` | no disponible (artefacto 1,8 GB) | no aplica | ROC-AUC 0,9514; especificidad `unknown` 99,52% | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un detector de SynthID ni verifica cargas de marcas de agua criptograficas o invisibles; `watermark_truth="unknown"` y una etiqueta de proveedor no prueba la presencia de SynthID.
- Las etiquetas describen pipelines completas de generacion y exportacion de pixeles, por lo que renderizador, geometria, codificacion, postprocesado y estado de marca de agua pueden confundirse entre si.
- La clase `unknown` no significa que SynthID este ausente; solo indica que el modelo no clasifica la imagen en ninguna familia de proveedor.
- Recall agregado limitado (56,67%) y especialmente bajo en vistas recompresadas (22,39%), lo que implica que muchas imagenes sinteticas derivadas no se atribuiran.
- Recall por proveedor desigual: `xai` (25,0%), `ideogram` (30,5%) y `flux` (40,6%) son los mas bajos, frente a `meta` (78,7%) y `google` (68,5%).
- Precision de version de Stage 2 baja en `ideogram` (65,3%) y `xai` (72,9%), y no disponible para `meta`.
- Riesgo de falsos positivos en variedades no fotograficas como `diagram` (1,02%) y `stress_recompressed` (1,94%), aunque el FPR global es bajo.
- No procesa texto ni audio; es exclusivamente un clasificador de imagen con caracteristicas de pixel fijas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios no cubiertos por el conjunto de evaluacion.
- El modelo no incluye imagenes de entrenamiento ni catalogo, lo que limita la auditoria independiente de sesgos del dataset.
- Cualquier uso en produccion forense o de moderacion deberia tratar la salida como indicio probabilistico, no como prueba concluyente de origen.

## Enlaces

- HuggingFace: https://huggingface.co/wiltodelta/raiw-source-classify
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
