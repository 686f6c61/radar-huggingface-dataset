# Starlinghq/kev-0.8b-onnx

## Resumen

Kev-0.8B (build de Starling, revision r1) es la exportacion a ONNX en fp32 del modelo de decision `jaredpalmer/kev-0.8b`, un modelo de 0,8 mil millones de parametros construido fusionando un adaptador LoRA sobre `Qwen/Qwen3.5-0.8B-Base`. El resultado no es un modelo generativo al uso: el repositorio separa el *backbone* (grafo ONNX que devuelve estados ocultos finales y mantiene cache de atencion y de estado Gated DeltaNet) de una cabeza de puntero (*pointer head*) con temperatura calibrada, almacenada aparte en `head.safetensors`. Es, por tanto, un modelo orientado a tareas de decision y seleccion sobre la entrada, no a decodificacion libre de texto.

Lo desarrolla StarlingHQ como artefacto de distribucion para su paquete .NET `Starlings.Models.Kev`, dentro del repositorio `starlinghq/starling`. El objetivo es que una aplicacion .NET pueda ejecutar inferencia local con onnxruntime-genai sin depender de Python ni de pesos en formato pickle: el paquete fija cada fichero por tamano y SHA-256 mediante `SHA256SUMS`, de modo que cualquier fichero alterado se rechaza.

Su relevancia actual es de nicho pero clara: demuestra un patron de despliegue de modelos pequenos como componentes deterministas dentro de aplicaciones de escritorio o backend, con verificacion criptografica de artefactos y soporte de CPU y de CUDA. La licencia es Apache-2.0 en todas las capas (adaptador, cabeza, pesos base y tokenizer).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion y estado Gated DeltaNet (derivado de Qwen3.5-0.8B-Base); exportado como grafo ONNX con caches de estado como entradas y salidas |
| Parametros totales | 0,8 mil millones (backbone) mas cabeza de puntero |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | solo fp32 en este repositorio; no se publican variantes int8, fp16 ni GGUF |
| Idiomas soportados | no disponibles (el tokenizer usa el perfil `qwen2-bpe-kev` del repositorio Kev) |
| Licencia | Apache-2.0 (adaptador, cabeza, pesos base y tokenizer) |
| Formato de pesos | ONNX (`model.onnx`, `model.onnx.data`) + `head.safetensors` + `head.json` + `tokenizer.json` |
| Tamano del repositorio | 3,1 GB |
| Modelo base | `jaredpalmer/kev-0.8b` en la revision `9a45d25eb2ab761841196625383fa1dff0e56c1e`, fusionado sobre `Qwen/Qwen3.5-0.8B-Base` en la revision `dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68` |
| Herramienta de exportacion | onnxruntime-genai model builder 0.17.1 (`-p fp32 -e cpu`, `exclude_lm_head=true`, `exclude_mtp=true`) |
| Cabeza de decision | `head.pt` convertido a `head.safetensors` (fp32, sin pickle) con temperatura calibrada en `head.json` |
| Runtime soportado | CPU execution provider (construido en CPU) y CUDA execution provider con `use_tf32=0` |

## Arquitectura y entrenamiento

El backbone sigue la arquitectura de Qwen3.5-0.8B-Base, que segun la model card combina capas de atencion con capas de estado Gated DeltaNet: el grafo ONNX expone explicitamente tanto la cache de atencion como la cache de estado Gated DeltaNet como entradas y salidas, lo que confirma un diseno hibrido con estado recurrente ademas de atencion clasica. La exportacion elimina la LM head (`exclude_lm_head=true`) y la cabeza MTP (`exclude_mtp=true`), de modo que el grafo devuelve unicamente los estados ocultos finales; la prediccion la realiza la cabeza de puntero incluida aparte.

Sobre el entrenamiento no se aportan datos en la informacion disponible: no se indica numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que si se documenta es el proceso de construccion: el adaptador LoRA de Kev se fusiona en fp32 con los pesos base usando el loader propio de Kev (fuente `6b719c3c3f367295f6ef336f4f751cf5ff970abc`, tag `kev-1.0`), y la fusion fp32 no es bit-reproducible entre compilaciones (diferencias de hasta 1,9e-9 en algunas proyecciones fusionadas), por lo que el repositorio publica la build cualificada en lugar de un script reproducible bit a bit. Los scripts de construccion son `model-pipeline/reference/kev/kev_merge.py` y el comando del builder descrito en el README del paquete del repositorio `starlinghq/starling`.

## Capacidades

- Backbone de 0,8B que produce estados ocultos finales sobre la secuencia de entrada, con gestion de cache de atencion y de estado Gated DeltaNet entre pasos.
- Cabeza de puntero (*pointer head*) con temperatura calibrada: el modelo esta disenado para seleccionar o apuntar a elementos de la entrada (spans, opciones, candidatos) en lugar de generar texto libre.
- Inferencia local en CPU mediante onnxruntime-genai y en GPU mediante el execution provider CUDA con `use_tf32=0`.
- Integracion nativa en .NET a traves del paquete `Starlings.Models.Kev`, con verificacion de integridad de cada fichero por tamano y SHA-256.
- Tokenizer propio con perfil `qwen2-bpe-kev`, tomado sin modificaciones del repositorio Kev en la revision fijada.
- Generacion de texto autoregresiva: no disponible en este repositorio (la LM head se excluye de la exportacion).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo *thinking* explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Extraccion de campos en documentos: usar la cabeza de puntero para seleccionar el span exacto de la entrada que corresponde a cada campo (importe, fecha, CIF), en lugar de generar el valor y arriesgar alucinacion. El modelo devuelve indices sobre el texto original, lo que permite validacion determinista.
- Enrutado de tickets o correos: clasificar la consulta y apuntar a la categoria o al departamento destino dentro de un conjunto cerrado de opciones, ejecutando el modelo en el propio servidor de aplicaciones .NET.
- Seleccion de herramienta en un asistente: dado un mensaje y un catalogo de funciones disponibles, elegir a cual apuntar. La cabeza de seleccion encaja mejor que un modelo generativo para este paso cuando el catalogo es fijo.
- Anonimizacion y deteccion de entidades: localizar spans de datos personales sobre el texto para sustituirlos, con la ventaja de que la salida son posiciones verificables sobre el documento original.
- Desambiguacion en asistentes conversacionales: resolver referencias ("ese pedido", "el segundo") apuntando al antecedente correcto en el historial, manteniendo el estado entre turnos mediante las caches de atencion y Gated DeltaNet.
- Componente de validacion en pipelines: usar el modelo como clasificador de aceptacion/rechazo de propuestas generadas por otro modelo mayor, aprovechando los 0,8B de parametros y el formato ONNX fp32 para ejecutarlo en la misma maquina que el servicio.
- Despliegue en escritorio o *edge*: al caber en el repositorio de 3,1 GB y ejecutarse en CPU, permite integraciones en aplicaciones de escritorio .NET sin GPU ni servicios externos, con artefactos verificados por SHA-256.
- Cumplimiento y auditoria: al fijar revisiones concretas de los pesos base, el tokenizer y el adaptador, es apto para entornos donde se exige reproducibilidad del artefacto desplegado (con la salvedad de la no reproducibilidad bit a bit de la fusion fp32).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas de seleccion o extraccion, y tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el backbone en fp32 ocupa aproximadamente 3,2 GB (0,8B x 4 bytes), a los que se suman los estados de cache de atencion y Gated DeltaNet y el margen del runtime; un presupuesto practico de 4-5 GB de VRAM es razonable, aunque no se publica una cifra oficial.
- Memoria en CPU: al soportar el execution provider de CPU, puede ejecutarse en RAM del sistema; el repositorio completo descargado son 3,1 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para el grafo fp32 (por ejemplo RTX 3060, RTX 4060 Ti, RTX 4090). En el segmento profesional, A100 o H100 funcionan pero estan sobredimensionadas para 0,8B. La model card solo confirma ejecucion sobre el execution provider CUDA con `use_tf32=0`.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas de VRAM; tambien en CPU.
- Opciones de despliegue: onnxruntime-genai 0.17.1 y el paquete .NET `Starlings.Models.Kev` del repositorio `starlinghq/starling`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; estos runtimes no pueden cargar el grafo tal cual porque la LM head esta excluida y la cabeza de decision es un fichero separado con su propia temperatura calibrada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Starlinghq/kev-0.8b-onnx | 0,8B | no disponible | ONNX fp32 + head.safetensors | Apache-2.0 | Exportacion para .NET con cabeza de decision separada; 3,1 GB |
| jaredpalmer/kev-0.8b | 0,8B | no disponible | no disponible | Apache-2.0 (segun metadatos citados) | Version original con adaptador LoRA sin fusionar y `head.pt`; requiere el loader de Kev |
| Qwen/Qwen3.5-0.8B-Base | 0,8B | no disponible | no disponible | Apache-2.0 | Backbone base sin la cabeza de decision; es un modelo de lenguaje, no un modelo de seleccion |

No se dispone de datos de benchmarks ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria. Cualquier otro modelo de decision o de extraccion de spans comparable no aparece en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion de texto: la LM head se excluye de la exportacion (`exclude_lm_head=true`), por lo que no puede usarse como sustituto de Qwen3.5-0.8B-Base para tareas generativas.
- La funcionalidad exacta de la cabeza de puntero no se describe en detalle en la model card; antes de integrarla en produccion hay que validar el formato de entrada y salida contra el paquete `Starlings.Models.Kev`.
- La fusion fp32 del adaptador LoRA no es bit-reproducible entre compilaciones (hasta 1,9e-9 en algunas proyecciones); solo la build publicada esta cualificada.
- La longitud de contexto no esta documentada, lo que impide planificar cargas de documentos largos sin pruebas previas.
- No se documentan los idiomas soportados; el tokenizer `qwen2-bpe-kev` sugiere herencia del tokenizer de Qwen, pero no hay confirmacion en la informacion disponible.
- No hay datos de sesgos, tasas de alucinacion ni evaluaciones de robustez. En un modelo de seleccion, el riesgo principal es apuntar al span equivocado con alta confianza, agravado por el uso de una temperatura calibrada sobre datos que no se detallan.
- La licencia Apache-2.0 permite uso comercial, pero se deben respetar `LICENSE` y `NOTICE` del repositorio, que cubren los pesos base de Qwen3.5 y el tokenizer.
- El modelo declara 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (17 de octubre de 2026): no hay evidencia de uso en produccion por terceros.
- Solo existe variante fp32; no hay cuantizaciones publicadas, lo que limita el despliegue en dispositivos con poca memoria.
- La busqueda web realizada no devolvio documentacion tecnica relevante sobre este modelo; los resultados obtenidos correspondian a paginas de un operador de telecomunicaciones sin relacion con el proyecto.

## Enlaces

- [Starlinghq/kev-0.8b-onnx en HuggingFace](https://huggingface.co/Starlinghq/kev-0.8b-onnx)
- [jaredpalmer/kev-0.8b (modelo base con el adaptador LoRA)](https://huggingface.co/jaredpalmer/kev-0.8b)
- [Qwen/Qwen3.5-0.8B-Base (backbone)](https://huggingface.co/Qwen/Qwen3.5-0.8B-Base)
- [Repositorio starlinghq/starling (paquete .NET Starlings.Models.Kev y scripts de build)](https://github.com/starlinghq/starling)
- Papers, blogs, demos y resultados de benchmarks: no disponibles en la informacion proporcionada.
