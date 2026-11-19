# stabilityai/stable-audio-3-medium

## Resumen

Stable Audio 3 Medium es un modelo de generacion de audio texto-a-audio desarrollado por Stability AI, orientado a la sintesis de musica y efectos de sonido. Se trata de un modelo de difusion de 2.305.495.793 parametros (aproximadamente 2,3 mil millones) publicado en Hugging Face bajo el identificador `stabilityai/stable-audio-3-medium`, con un repositorio de 10,4 GB en formato safetensors. Es un fine-tune del modelo base `stabilityai/stable-audio-3-medium-base` y forma parte de la familia stable-audio-3.

El modelo resuelve el problema de generar audio de alta fidelidad a partir de descripciones textuales, cubriendo tanto musica como efectos de sonido. Su relevancia actual radica en que ofrece una alternativa de pesos abiertos (con acceso restringido) en un segmento dominado por servicios propietarios de generacion musical, permitiendo a desarrolladores e investigadores integrar generacion de audio en sus propios pipelines sin depender de APIs externas.

La ficha se basa exclusivamente en los metadatos disponibles en Hugging Face. No se dispone de informacion publica detallada sobre arquitectura interna, composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada, por lo que esos apartados se marcan como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de audio (detalle interno no disponible) |
| Parametros totales | 2.305.495.793 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | stable-audio-community (marcada como "other" en los tags) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 10,4 GB |
| Pipeline | text-to-audio |
| Libreria | stable-audio-3 |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Modelo base | stabilityai/stable-audio-3-medium-base |

## Arquitectura y entrenamiento

El modelo se describe en los metadatos como un modelo de difusion para generacion de audio (tags `diffusion` y `text-to-audio`), con 2.305.495.793 parametros en formato safetensors. No se dispone de informacion detallada sobre la arquitectura interna (tipo de encoder de texto, arquitectura del decodificador de audio, tipo de scheduler de difusion, uso de latentes o generacion en dominio de onda) en la informacion proporcionada.

Respecto al entrenamiento, la unica informacion disponible es que se trata de un fine-tune del modelo `stabilityai/stable-audio-3-medium-base`. No se conocen el numero de tokens o horas de audio empleadas, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.) en los datos disponibles.

## Capacidades

- Generacion de audio a partir de texto (text-to-audio): sintesis de clips de audio condicionados por una descripcion textual.
- Generacion musical: produccion de fragmentos musicales a partir de prompts descriptivos.
- Generacion de efectos de sonido: creacion de SFX para videojuegos, cine o produccion multimedia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: limitadas al ingles segun los metadatos (`en`).
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio de entrada en la informacion disponible.

## Casos de uso

- Produccion musical asistida: el modelo puede generar fragmentos musicales a partir de descripciones textuales, lo que permite a compositores y productores obtener borradores o ideas base rapidamente sin partir de cero.
- Diseno de efectos de sonido para videojuegos: los estudios pueden generar SFX especificos (pasos, impactos, ambientes) mediante prompts, agilizando la iteracion en el diseno sonoro.
- Postproduccion audiovisual: generacion de ambientes y texturas sonoras para cine, publicidad o podcasts, integrable en pipelines de edicion como fuente de material adicional.
- Creacion de contenido para redes y multimedia: generacion de jingles, cortinillas o fondos musicales para videos cortos y contenido digital.
- Prototipado rapido en herramientas creativas: integracion del modelo en aplicaciones de diseno sonoro para ofrecer generacion bajo demanda a usuarios no tecnicos.
- Investigacion en generacion de audio: al ser un modelo de pesos abiertos con acceso restringido, sirve como base para experimentos de fine-tuning, evaluacion de metodos de difusion aplicados a audio o estudios comparativos.
- Aumento de datos para entrenamiento de otros sistemas: generacion de clips de audio sinteticos etiquetados para ampliar datasets de tareas de clasificacion o deteccion de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamano del repositorio (10,4 GB en safetensors), la inferencia en precision completa requeriria al menos esa cantidad de memoria, y en la practica mas por los estados intermedios del proceso de difusion.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de pesos (10,4 GB) sugiere que podria requerir GPUs con 16 GB o mas de VRAM, pero este dato no esta verificado en la informacion disponible.
- Opciones de despliegue: la libreria asociada es `stable-audio-3`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a difusion de audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stable Audio 3 Medium | 2.305.495.793 | No disponible | stable-audio-community | Pesos abiertos con acceso restringido |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse presumiblemente con datos musicales y de audio, podria reflejar sesgos estilisticos y culturales del dataset.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje, pero la generacion puede producir audio incoherente o no fiel al prompt en casos ambiguos o poco representados.
- Limitaciones de idioma: el modelo solo declara soporte para ingles (`en`), por lo que los prompts en castellano pueden degradar la calidad o el ajuste al texto.
- Restricciones de licencia: la licencia `stable-audio-community` (marcada como "other") impone condiciones especificas de uso; es imprescindible revisar los terminos antes de cualquier uso comercial.
- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face, lo que anade un paso administrativo antes de la descarga.
- Caveats para produccion: no se dispone de datos publicos sobre latencia, throughput ni estabilidad en entornos de alta carga, por lo que sera necesario realizar pruebas propias de rendimiento antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stabilityai/stable-audio-3-medium
- Modelo base: https://huggingface.co/stabilityai/stable-audio-3-medium-base
- Paper de referencia (arXiv): https://arxiv.org/abs/2605.17991
