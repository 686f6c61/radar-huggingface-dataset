# voicort/sn92-generalist-r2-g

## Resumen

voicort/sn92-generalist-r2-g es un modelo publicado por el usuario voicort en Hugging Face, etiquetado como `gemma4` y orientado a tareas de decision y clasificacion de texto, con soporte declarado para entrada imagen-texto (`image-text-to-text`). El repositorio tiene acceso restringido (gated) y, en el momento de la consulta, no registra descargas ni interacciones. La informacion disponible es escasa: la model card publica no aporta detalles sobre datos de entrenamiento, proceso de alineacion ni resultados de evaluacion.

El dato mas solido es el recuento de parametros del archivo safetensors: 31.273.088.876 parametros (aproximadamente 31,3 mil millones), con un repositorio de 62,6 GB, lo que sugiere pesos en precision bf16/fp16. El tag `gemma4` apunta a una arquitectura de la familia Gemma, aunque no se confirma que sea un modelo oficial de Google ni que mantenga la arquitectura exacta de dicha familia.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un modelo de autor individual, sin traccion publica, sin benchmarks y con acceso condicionado. Es util como referencia tecnica de un checkpoint de ~31B orientado a clasificacion y decision, pero no debe asumirse calidad de produccion sin una evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `gemma4`; no confirmado como arquitectura oficial) |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, ~62,6 GB, compatible con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Modalidades | texto e imagen (tag `image-text-to-text`) |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Libreria | transformers |
| Tamano del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla del tag `gemma4`, que sugiere una base de tipo transformer decoder-only de la familia Gemma. El recuento de parametros (31,3 B) y el tamano del repositorio (62,6 GB) son coherentes con pesos en bf16, pero no se confirma si el modelo incorpora componentes multimodales reales (vision encoder) o si el tag `image-text-to-text` refleja una capacidad efectiva.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporción de codigo o multilingue), ni sobre procesos de alineacion (RLHF, DPO, SFT). El tag `reax` y la etiqueta `decision-model` no vienen acompanados de documentacion que explique su significado tecnico. Cualquier afirmacion sobre innovaciones (atencion lineal, decodificacion especulativa, mezcla de expertos) seria especulativa y no se incluye.

## Capacidades

- Clasificacion de texto: pipeline declarado `text-classification`, lo que sugiere uso para etiquetado y decision sobre entradas textuales.
- Procesamiento imagen-texto: el tag `image-text-to-text` indica soporte declarado de entrada multimodal, sin documentacion que lo verifique.
- Modelo de decision: la etiqueta `decision-model` sugiere un uso orientado a seleccion o enrutamiento, sin especificarse el mecanismo.
- Compatibilidad con endpoints: tag `endpoints_compatible`, lo que indica que el repositorio esta preparado para despliegue mediante Inference Endpoints de Hugging Face.
- Generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes y modo thinking: no disponible (no declarado en la informacion proporcionada).
- Capacidades multilingues: no disponible.

## Casos de uso

- Clasificacion y enrutamiento de tickets: dado el pipeline `text-classification`, el modelo puede emplearse para asignar categorias o prioridades a solicitudes entrantes en un sistema de soporte, siempre que se valide su calidad con un conjunto de evaluacion propio.
- Moderacion de contenido textual: uso como clasificador auxiliar para filtrar o etiquetar textos antes de su publicacion, con umbrales calibrados sobre datos del dominio.
- Etiquetado de datos a escala: generacion de etiquetas preliminares para construir o ampliar datasets supervisados, con revision humana posterior.
- Analisis de documentos con imagen y texto: si la capacidad multimodal se confirma, extraccion de informacion a partir de capturas, formularios escaneados o documentos mixtos.
- Despliegue en Hugging Face Inference Endpoints: el tag `endpoints_compatible` permite servirlo como servicio gestionado para prototipos internos, sujeto al acceso gated.
- Evaluacion comparativa interna: uso como checkpoint de referencia de ~31B en experimentos de clasificacion, comparando su comportamiento frente a modelos consolidados antes de adoptarlo.
- Filtrado previo en pipelines RAG: clasificacion de consultas para decidir si requieren recuperacion documental o respuesta directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62-64 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica, 80 GB por GPU es el minimo comodo.
- Cuantizacion a 8 bits: en torno a 32-35 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090.
- Cuantizacion a 4 bits: en torno a 16-20 GB de VRAM, potencialmente ejecutable en una RTX 4090 (24 GB) o RTX 3090, con perdida de calidad no evaluada.
- GPU recomendadas: A100 80 GB, H100 80 GB para precision completa; A100 40 GB o configuraciones multi-GPU para 8 bits.
- Consumer GPU: no cabe en precision completa; solo con cuantizacion agresiva (4 bits) en GPUs de 24 GB.
- Opciones de despliegue: transformers (libreria declarada), Hugging Face Inference Endpoints (tag `endpoints_compatible`); vLLM, TGI, llama.cpp u Ollama no estan confirmados para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| voicort/sn92-generalist-r2-g | ~31,3 B | no disponible | apache-2.0 | gated | Sin benchmarks ni documentacion de entrenamiento |
| Gemma 2 27B (Google) | 27 B | 8K | Gemma license | abierto | Modelo oficial con evaluaciones publicadas |
| Qwen2.5 32B (Alibaba) | 32,5 B | 128K | Apache-2.0 | abierto | Amplia documentacion y benchmarks |
| Mistral Small 24B | 24 B | 128K | Apache-2.0 | abierto | Orientado a instrucciones y tool calling |

La comparacion es estructural: el checkpoint de voicort no publica evaluaciones, por lo que no puede establecerse equivalencia de rendimiento con los modelos citados. La licencia apache-2.0 es favorable frente a la licencia Gemma, pero el acceso gated limita su distribucion.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de model card detallada: no hay evidencia publica de calidad, y el modelo no registra descargas ni validacion de la comunidad.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede impedir el uso automatizado o la redistribucion.
- Tags potencialmente inconsistentes: `gemma4` no corresponde a una familia oficial confirmada, y `image-text-to-text` convive con un pipeline de `text-classification`; la capacidad multimodal debe verificarse.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados; al ser un modelo de ~31B sin alineacion publica conocida, se recomienda validacion exhaustiva en el dominio objetivo.
- Idiomas soportados no declarados: no puede asumirse un rendimiento multilingue.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar los terminos del acceso gated antes de integrarlo en produccion.
- Contexto desconocido: no debe planificarse su uso en escenarios de contexto largo sin medir previamente la ventana efectiva.

## Enlaces

- Hugging Face: https://huggingface.co/voicort/sn92-generalist-r2-g
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
