# trevor000/Ternary-Bonsai-2-27B-RTX4070

## Resumen

Ternary-Bonsai-2-27B-RTX4070 es un artefacto de investigación publicado por el usuario trevor000 en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un empaquetado y recuantización preparado en CPU a partir del GGUF Ternary Bonsai 2 27B de Prism ML, que a su vez deriva del modelo Qwen/Qwen3.8-27B. El resultado es un único fichero GGUF (`Ternary-Bonsai-2-27B-PQ2_0-MTP-Q4_K_M.gguf`) que combina el objetivo ternario PQ2_0 de Prism con una preparación de cabeza MTP (multi-token prediction) cuantizada únicamente en Q4_K_M.

El interés del artefacto es práctico y acotado: documenta una campaña de medida reproducible sobre una GPU de consumo (RTX 4070) con un modelo de aproximadamente 27.320 millones de parámetros comprimido a un formato ternario empaquetado. El autor reporta 81,65 tok/s en un fixture corto, 68,30 tok/s con contexto lleno de 46K tokens y 51,37 tok/s con contexto lleno de 60K tokens, además de un test de regresión aritmética de 20/20. Estas cifras son históricas de su laboratorio, no una promesa de rendimiento universal.

Su relevancia ahora es doble. Por un lado, muestra que es viable ejecutar un modelo de ~27B en cuantización ternaria dentro de los 12 GB de VRAM de una RTX 4070. Por otro, sirve como caso de estudio de procedencia: el repositorio fija el SHA256 del artefacto fuente en `provenance.json`, documenta el mapeo de tensores y advierte explícitamente de que el llama.cpp estándar no está garantizado como compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de la familia Qwen3.8-27B; incluye cabeza MTP para decodificacion especulativa) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible como especificacion oficial; el autor valida perfiles con contexto lleno de 46K y 60K tokens y asigna 48K de contexto FP16 en la medicion corta |
| Tipos de cuantizacion | Objetivo ternario PQ2_0 (Prism); cabeza MTP en Q4_K_M; perfiles de KV cache FP16 y Q4 (claves) + FP16 (valores) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (se preservan el aviso de Prism ML y la licencia de Qwen) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 7,5 GB |
| Fichero principal | Ternary-Bonsai-2-27B-PQ2_0-MTP-Q4_K_M.gguf |
| Modelo base | Qwen/Qwen3.8-27B (via Prism ML Ternary Bonsai 2 27B) |
| Fecha de publicacion | 2026-09-20 |

## Arquitectura y entrenamiento

No se publica informacion sobre la arquitectura interna del modelo base mas alla de su origen en la familia Qwen3.8-27B y de que el artefacto incorpora una cabeza MTP (multi-token prediction). La innovacion del repositorio no es arquitectonica sino de empaquetado: se parte del objetivo ternario PQ2_0 de Prism ML y se sustituye la preparacion de la cabeza MTP por una cuantizacion Q4_K_M. Segun la model card, se cuantizaron 8 matrices MTP y se preservaron sin cambios 7 tensores de normalizacion MTP, manteniendo intactos los tensores y metadatos del objetivo original.

No hubo entrenamiento ni ajuste adicional: el autor describe el resultado como un artefacto de empaquetado y cuantizacion preparado en CPU, no como un modelo nuevo. Tampoco se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO, ya que todo ello corresponde al modelo upstream y no se reproduce en esta ficha. La preparacion MTP sigue el experimento independiente del donante ProCreations (Ternary-Bonsai-2-27B-MTP) y no una publicacion oficial de Prism ML o Qwen.

El elemento tecnico diferencial es, por tanto, la combinacion de cuantizacion ternaria del modelo objetivo con una cabeza MTP cuantizada de forma separada, orientada a decodificacion especulativa. El autor advierte de que el artefacto requiere un runtime Bonsai-compatible de Prism/llama.cpp que entienda el layout de rotacion empaquetada y de MTP, con un pin concreto de laboratorio (Prism PR205, commit `518ad108f0b72bac4f397a486695a5786e33a58d`).

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y `endpoints_compatible`.
- Decodificacion especulativa mediante cabeza MTP: la preparacion Q4_K_M de las matrices MTP esta pensada para acelerar la inferencia con multi-token prediction.
- Ejecucion en cuantizacion ternaria: el objetivo PQ2_0 reduce el peso del modelo lo suficiente para caber en una GPU de consumo de 12 GB junto con contexto largo.
- Contexto largo en la practica: el autor mide con contexto lleno de 46K y 60K tokens, con distintas configuraciones de KV cache.
- Aritmetica basica: el autor reporta 20/20 en un test de regresion aritmetica pequeno y publico, que el propio autor califica como prueba de regresion, no como medida de inteligencia general.
- Capacidades de tool calling, agentes, vision, audio o modo de razonamiento explicito: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara lista de idiomas.

## Casos de uso

- Investigacion sobre cuantizacion ternaria: reproducir el pipeline de empaquetado PQ2_0 con cabeza MTP en Q4_K_M para estudiar el impacto de la cuantizacion en calidad y velocidad sobre un modelo de ~27B.
- Evaluacion de decodificacion especulativa en GPU de consumo: medir la ganancia real de la cabeza MTP en una RTX 4070 comparando con y sin prediccion multi-token, usando los fixtures del laboratorio como referencia.
- Prototipado de asistentes conversacionales en hardware modesto: el modelo cabe en 12 GB de VRAM y soporta contexto largo, lo que permite levantar un chat local de pruebas sin infraestructura de datacenter.
- Analisis de documentos largos en local: los perfiles con contexto lleno de 46K y 60K tokens permiten experimentar con resumen y preguntas sobre documentos extensos manteniendo los datos en la maquina.
- Auditoria de procedencia y reproducibilidad: el repositorio incluye `provenance.json` con el SHA256 del artefacto fuente y `artifact-tensor-manifest.json` con el mapeo de tensores, lo que lo convierte en un caso practico para validar cadenas de custodia en publicaciones de modelos derivados.
- Estudio de compatibilidad de runtimes: sirve para comprobar que diferencias introducen los forks de llama.cpp frente al llama.cpp estandar al consumir layouts empaquetados y cabezas MTP.
- Referencia docente sobre cuantizacion extrema: ilustra en un caso real la relacion entre bits por peso, tamano en disco (7,5 GB de repositorio) y throughput medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos son mediciones de laboratorio del propio autor sobre una RTX 4070:

| Escenario | Contexto | Throughput medido |
|---|---|---|
| Fixture corto (mediana de 3 ejecuciones, 48K de contexto FP16 asignado, salida fija de 2048 tokens) | 48K asignado | 81,65 tok/s |
| Contexto lleno con historial y KV en FP16 | 46K lleno | 68,30 tok/s |
| Contexto lleno con claves en Q4 y valores en FP16 | 60K lleno | 51,37 tok/s |
| Test de regresion aritmetica pequeno y publico | no aplica | 20/20 |

Estos perfiles incluyen una capa de dispatch BF16 para lotes pequenos propia del laboratorio. El autor insiste en que son medidas historicas de su campana de investigacion y no una garantia de rendimiento. Los numeros historicos del artefacto donante de ProCreations se midieron en una RTX PRO 6000 Blackwell y el autor no los reclama para este artefacto.

## Requisitos de hardware

- VRAM estimada: no publicada de forma explicita. El autor valida ejecucion en una RTX 4070 (12 GB) con perfiles de contexto lleno de 46K y 60K tokens, por lo que el artefacto cabe en 12 GB con esas configuraciones.
- GPU validadas: NVIDIA RTX 4070 (arquitectura Ada Lovelace, 12 GB). Es la unica GPU con resultados reportados para este artefacto.
- GPU recomendadas: no disponibles. Cualquier GPU con al menos 12 GB de VRAM podria ser candidata, pero el autor no afirma compatibilidad fuera de la RTX 4070.
- Cabe en GPU de consumo: si, al menos en RTX 4070. El repositorio ocupa 7,5 GB, lo que deja margen para cache KV y overhead del runtime dentro de los 12 GB.
- Opciones de despliegue: runtime Bonsai-compatible de Prism/llama.cpp con soporte del layout de rotacion empaquetada y MTP, pin de laboratorio Prism PR205, commit `518ad108f0b72bac4f397a486695a5786e33a58d`. El punto de entrada en Windows es `bonsai/work/bonsai-chat/start-bonsai-chat.ps1 -Profile balanced`. El llama.cpp estandar no esta declarado compatible. No se mencionan vLLM, TGI, Ollama ni otras alternativas.
- Latencia y throughput: 81,65 tok/s en fixture corto, 68,30 tok/s con 46K de contexto lleno y 51,37 tok/s con 60K de contexto lleno, en RTX 4070 y con los perfiles descritos.
- Descarga: `hf download trevor000/Ternary-Bonsai-2-27B-RTX4070 --local-dir Ternary-Bonsai-2-27B-RTX4070`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-RTX4070 (este artefacto) | 27.320.697.856 | perfiles medidos a 46K y 60K | GGUF (PQ2_0 + MTP Q4_K_M) | Apache-2.0 | Publico en HuggingFace, 0 descargas y 0 likes |
| Prism ML Ternary Bonsai 2 27B GGUF (upstream directo) | no disponible | no disponible | GGUF | Apache-2.0 | Publico en HuggingFace |
| Qwen/Qwen3.8-27B (modelo base original) | no disponible | no disponible | no disponible | licencia Qwen preservada en este repositorio | Publico en HuggingFace |
| ProCreations Ternary-Bonsai-2-27B-MTP (donante del experimento MTP) | no disponible | no disponible | no disponible | no disponible | Publico en HuggingFace |

No se dispone de datos de rendimiento comparables entre estas variantes dentro de la informacion proporcionada; las unicas cifras de throughput publicadas corresponden a este artefacto sobre RTX 4070.

## Limitaciones y advertencias

- No es un modelo nuevo: es un artefacto de empaquetado y cuantizacion preparado en CPU sobre pesos ya existentes. No aporta capacidades que no tuviera el modelo del que deriva.
- Alucinaciones: la propia model card documenta que las alucinaciones factuales siguen siendo una limitacion conocida del checkpoint.
- El resultado 20/20 en aritmetica es un test de regresion pequeno y publico; no debe interpretarse como una medida de inteligencia general ni extrapolarse a otras tareas.
- Compatibilidad de runtime restringida: requiere un fork especifico de Prism/llama.cpp (PR205, commit concreto). El llama.cpp estandar no esta declarado compatible, lo que complica el despliegue en entornos estandarizados.
- Rendimiento dependiente del perfil: las cifras de tok/s incluyen una capa de dispatch BF16 propia del laboratorio y perfiles concretos de KV cache. Fuera de esas condiciones los numeros pueden no reproducirse.
- Procedencia incompleta del donante: la revision fuente del artefacto de ProCreations no se capturo en la instantanea del laboratorio, por lo que la procedencia publica fija la identidad del donante y el SHA del artefacto derivado, pero no un commit concreto.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Idiomas soportados no declarados: no hay garantia documentada de cobertura multilingue ni de calidad por idioma.
- Licencia: Apache-2.0, pero con obligacion de preservar el aviso de Prism ML (`NOTICE.txt`), la licencia Apache-2.0 de Prism y la licencia de Qwen incluida. Para uso comercial conviene revisar esas tres capas antes de distribuirlo.
- No es una publicacion oficial: ni Prism ML ni Qwen respaldan este artefacto; el autor lo indica de forma explicita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trevor000/Ternary-Bonsai-2-27B-RTX4070
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF upstream de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Revision concreta del modelo de Prism referenciada: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/tree/6ed5e12bf84b7a63069882c91dd9e9218647d17b
- Donante del experimento MTP: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- Laboratorio de inferencia RTX 4070: https://github.com/trevor050/escha-rtx4070-lab
- Informe final medido: https://github.com/trevor050/escha-rtx4070-lab/blob/main/bonsai/reports/BONSAI_FINAL_REPORT_2026-09-19.md
- Instrucciones de lanzador y perfil: https://github.com/trevor050/escha-rtx4070-lab/blob/main/bonsai/work/bonsai-chat/README.md
