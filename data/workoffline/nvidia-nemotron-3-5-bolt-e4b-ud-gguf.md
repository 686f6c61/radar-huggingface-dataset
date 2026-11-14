# WorkOffline/NVIDIA-Nemotron-3.5-Bolt-E4B-UD-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B es un modelo de lenguaje desarrollado por NVIDIA, publicado originalmente en formato BF16 bajo el identificador `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`. El repositorio analizado aquí es un espejo no oficial mantenido por el usuario WorkOffline, que redistribuye una cuantización GGUF Q4_K_XL generada por Unsloth con el método Dynamic (UD) y validada mediante SHA-256. El objetivo del espejo es servir como origen único de descarga para una aplicación cliente concreta (WorkOffline), fijando una revisión exacta del artefacto.

El modelo cuenta con 7.518.069.290 parámetros totales según los safetensors del modelo base, lo que lo sitúa en la franja de los 7-8 mil millones de parámetros. El sufijo "E4B" en el nombre sugiere una variante de eficiencia dentro de la familia Nemotron 3.5 Bolt, aunque la información disponible no detalla su significado exacto ni confirma si se trata de una arquitectura MoE con parámetros activos reducidos. No se dispone de datos sobre longitud de contexto, composición del dataset de entrenamiento ni proceso de alineación.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto GGUF listo para inferencia local con un tamaño de 5.060.482.240 bytes (aproximadamente 4,71 GiB); por otro, advierte de que se trata de una copia de terceros, no del repositorio oficial de NVIDIA, y que los detalles técnicos del modelo original no están publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de la familia Nemotron 3.5 Bolt; detalles no publicados en la informacion disponible) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_XL (Unsloth Dynamic, UD-Q4_K_XL); el modelo base se distribuye en BF16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement 1.1 (etiquetada como `other` en Hugging Face); incluye un fichero adicional `LICENSE-Gemma-4-Apache-2.0.txt` |
| Formato de pesos | GGUF (un unico fichero `NVIDIA-Nemotron-3.5-Bolt-E4B-UD-Q4_K_XL.gguf`); el modelo base en safetensors BF16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. El nombre "Nemotron 3.5 Bolt E4B" y el recuento de 7.518.069.290 parametros totales indican un modelo de escala 7-8B, pero la informacion proporcionada no confirma si emplea un transformer denso convencional, una arquitectura MoE con parametros activos reducidos (el sufijo "E4B" podria ser indicativo, aunque no se verifica) ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similar. El unico dato tecnico verificable del proceso de produccion de este repositorio es la cuantizacion: Unsloth Dynamic Q4_K_XL, un esquema de cuantizacion de 4 bits con asignacion dinamica de precision por capa, que prioriza la calidad en las capas mas sensibles. El espejo fija la revision upstream `b738967d6da3441a7d1c71fcec15e49e32e16ecd` y verifica la integridad con SHA-256 (`84ff34f5834b929043f5ae74799e8d562d4056998f6a5923ceb44831e8ad84d6`).

## Capacidades

- Generacion de texto conversacional: el tag `conversational` en Hugging Face indica uso previsto para dialogos multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el artefacto puede servirse a traves de APIs compatibles con el formato de endpoints habitual (no se especifica cual).
- Inferencia local en CPU/GPU: al estar en formato GGUF, es ejecutable con llama.cpp y derivados (Ollama, LM Studio, etc.).
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling, agentes o modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el campo de idiomas del repositorio esta vacio.
- Capacidad especial destacable: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: el fichero GGUF de 4,71 GiB puede cargarse en RAM con llama.cpp u Ollama, permitiendo conversaciones con un modelo de ~7,5B parametros en equipos de 8-16 GB de RAM.
- Prototipado de asistentes conversacionales offline: el tag `conversational` y la naturaleza local del artefacto lo hacen adecuado para construir demos de chat sin depender de servicios en la nube ni de conectividad.
- Integracion en aplicaciones de escritorio con descarga verificada: el espejo esta pensado para que una app cliente descargue el fichero desde una unica ubicacion, con revision fijada y comprobacion SHA-256, lo que simplifica la distribucion reproducible de modelos en productos de escritorio.
- Evaluacion comparativa de cuantizaciones: al disponer del BF16 original y del Q4_K_XL de Unsloth, es posible medir la degradacion de calidad entre precisiones en tareas concretas antes de decidir el formato de produccion.
- Educacion e investigacion sobre cuantizacion: el repositorio documenta explicitamente el origen, la revision y el hash del artefacto, lo que facilita reproducir experimentos y auditar la cadena de suministro del modelo.
- Experimentacion con pipelines de inferencia GGUF: sirve para validar configuraciones de llama.cpp, Ollama o servidores compatibles (numero de hilos, offload de capas a GPU, tamano de batch) con un modelo de escala media.
- Pruebas de integracion en CI: el hash SHA-256 publicado permite verificar en pipelines que el artefacto descargado es exactamente el esperado, evitando regresiones por cambios silenciosos upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero Q4_K_XL ocupa 5.060.482.240 bytes (~4,71 GiB); se recomienda al menos 6-8 GB de memoria libre para cargar el modelo, la cache KV y el contexto.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU consumer con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) deberia poder alojar el modelo completo en Q4_K_XL, aunque no se confirma en la documentacion.
- Cabe en GPU consumer: previsiblemente si, en tarjetas de 8 GB o superiores, dado el tamano del fichero; no verificado con datos de rendimiento.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` apunta a servidores de inferencia con API, sin especificar cuales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un espejo no oficial: el repositorio pertenece a WorkOffline, no a NVIDIA; la responsabilidad sobre el contenido original recae en NVIDIA y la conversion GGUF en Unsloth.
- Sin datos de evaluacion: no hay benchmarks, idiomas declarados ni documentacion de sesgos, alucinacion o limitaciones de contexto en la informacion disponible.
- Licencia compleja: la licencia es OpenMDW 1.1, etiquetada como `other`, e incluye un fichero adicional `LICENSE-Gemma-4-Apache-2.0.txt` cuyo alcance no se explica; es imprescindible revisar ambos textos antes de un uso comercial.
- Riesgo de cadena de suministro: aunque el repositorio publica revision upstream y SHA-256, conviene verificar el hash tras la descarga y contrastar con el repositorio oficial de NVIDIA y con el de Unsloth.
- Fecha de creacion futura: el repositorio figura creado el 2026-11-13, lo que puede indicar metadatos anomalos o un entorno de publicacion no estandar; conviene tratarlo con cautela.
- Sin garantias de soporte: al ser una copia de terceros, no hay canal de soporte ni actualizaciones garantizadas por parte de NVIDIA.
- Cuantizacion de 4 bits: Q4_K_XL introduce perdida de precision respecto al BF16 original; no se han publicado mediciones de esa degradacion para este modelo.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/WorkOffline/NVIDIA-Nemotron-3.5-Bolt-E4B-UD-GGUF
- Modelo base oficial: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- GGUF de Unsloth: https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
