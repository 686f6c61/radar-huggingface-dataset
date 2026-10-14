# ttindall/Qwen3.8-27B-Uncensored-HauhauCS-NInfer

## Resumen

El repositorio ttindall/Qwen3.8-27B-Uncensored-HauhauCS-NInfer publica un artefacto de inferencia en formato `.ninfer`, el contenedor propio del motor NInfer, construido a partir del tune HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF y cuyo checkpoint de referencia es Qwen/Qwen3.8-27B. No es un checkpoint de Transformers, ni safetensors ni GGUF: solo lo lee el motor NInfer compilado para sm_89 (RTX 4090), y no carga en transformers, vLLM, llama.cpp ni LM Studio. El repositorio ocupa 40,9 GB y contiene dos ficheros de 19,03 GiB cada uno (contenedor v2 y v3) que transportan exactamente los mismos pesos.

El artefacto es multimodal (pipeline `image-text-to-text`): un unico fichero incluye los 333 tensores `model.visual.*`, el cabezal MTP, los objetos DFlash2 y de proposal-head, el tokenizador, la plantilla de chat y el procesador de medios, por lo que acepta texto, imagen y video como entrada. La cuantizacion parte del GGUF `Q8_K_P` de origen y se reempaqueta con una asignacion groupwise Q4/Q5/Q6 para el cuerpo de texto y `W8G32_F16S` para el embedding de tokens y el cabezal de salida completo.

Se trata de un tune "uncensored" explicito: HauhauCS declara 0/465 rechazos en su conjunto de prueba y el perfil Aggressive responde a consignas duras con preambulo minimo. Su interes practico es permitir un modelo multimodal de aproximadamente 27 000 millones de parametros en una unica GPU de consumo de 24 GB, a cambio de quedar atado por completo al ecosistema NInfer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; el arbol de tensores incluye componentes de atencion lineal (linear_attn.norm, A_log, dt_bias, conv1d) junto con atencion convencional, MTP y vision |
| Parametros totales | 27 000 millones segun la denominacion del repositorio (no se desglosa el recuento en la model card) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuerpo de texto con asignacion groupwise Q4/Q5/Q6; embedding de tokens y cabezal de salida en W8G32_F16S; origen GGUF Q8_K_P |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.ninfer` (contenedor propietario NInfer, generaciones v2 y v3); incompatible con safetensors, GGUF, transformers, vLLM, llama.cpp y LM Studio |

Datos adicionales del artefacto: 1 190 objetos almacenados (1 184 tensores y 6 recursos), ID de modelo NInfer `qwen3.8-27b`, ID de pesos `groupwise-int`, clave de destino `qwen3_8_27b`, identidad de fichero v3 `fe841303edb94e3da01939339908d226` y politica de activacion v3 `A16Only` declarada en las 844 utilizaciones.

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, del que la model card solo aporta informacion indirecta: la lista de transformaciones invertidas durante la conversion menciona `linear_attn.norm`, `A_log`, `dt_bias` y un `conv1d` que se aplana, lo que indica la presencia de componentes de atencion lineal o de espacio de estados junto a la atencion convencional, ademas de un cabezal de prediccion multi-token (MTP) y una torre de vision con 333 tensores `model.visual.*`. No se publican datos sobre numero de tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO para este repositorio.

Este repositorio no entrena nada: es una conversion y recuantizacion. El proceso tuvo dos etapas. Primero, `tools/convert/gguf_to_hf` desquantizo el GGUF `Q8_K_P` de HauhauCS e invirtio las transformaciones que llama.cpp aplica en la exportacion (reordenacion grouped-to-tiled de las cabezas V, conversion de `A_log` a `-exp`, renombrado de `dt_bias`, compresion del conv1d y suma de `+1` a cada `*norm.weight` salvo `linear_attn.norm`), produciendo 1 199 tensores BF16 en 20 shards: 866 derivados del GGUF y 333 tensores de vision mas los ficheros de frontend tomados del checkpoint de referencia. Despues, el conversor estandar `qwen3_8_27b` cuantizo ese arbol en CUDA en 181,8 segundos. El fichero v3 no es una segunda conversion: se genero desde el v2 mediante `tools/upgrade_ninfer_v2_to_v3.py`, conservando 1 189 de sus 1 190 objetos con el mismo offset y longitud y sustituyendo unicamente `frontend/chat_template.jinja` por la plantilla `qwen3_8.jinja` que espera el runtime v3.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia (`qwen3_8.jinja`) incluida en el contenedor.
- Entrada multimodal de imagen y video: el fichero incorpora los 333 tensores `model.visual.*` y el objeto media-processor, por lo que un unico artefacto sirve texto, imagen y video.
- Decodificacion especulativa mediante prediccion multi-token (MTP), con el companero DFlash2 `z-lab/Qwen3.8-27B-DFlash2` incluido en el paquete aunque no se usa con la opcion `--spec mtp`.
- Respuestas sin rechazo por diseno: HauhauCS reporta 0/465 rechazos en su conjunto de prueba y un perfil Aggressive con preambulo minimo.
- Soporte de tool calling / function calling: no disponible, no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio esta vacio.
- Modo de razonamiento explicito (thinking mode): no disponible, no documentado.

## Casos de uso

- Inferencia multimodal local en una RTX 4090: el artefacto esta disenado para ejecutarse en una unica GPU de 24 GB con el motor NInfer compilado para sm_89, lo que permite trabajar con texto, imagen y video sin depender de servicios en la nube ni de GPUs de centro de datos.
- Investigacion sobre desalineacion y seguridad de modelos: al ser un tune declarado sin censura, resulta util como sujeto de pruebas en estudios de red teaming, evaluacion de salvaguardas y analisis de tasas de rechazo frente a un modelo de referencia alineado.
- Procesamiento por lotes de imagen y video en local: descripcion de contenido visual, resumen de clips o extraccion de informacion de fotogramas, aprovechando que la torre de vision viaja dentro del mismo fichero que el modelo de lenguaje.
- Generacion de texto creativo sin restricciones editoriales: ficcion, guiones o material de ambientacion donde los filtros de rechazo de modelos alineados interrumpen el flujo, con la responsabilidad legal y etica en el operador.
- Despliegue de un servicio de chat en un servidor Linux con una sola GPU: mediante `ninfer-serve` en la build correspondiente al contenedor (v2 o v3), con la advertencia de que el binario y la version del contenedor deben emparejarse exactamente.
- Experimentacion con decodificacion especulativa: el paquete incluye los objetos MTP y el companero DFlash2, lo que permite medir el efecto del modo `--spec mtp` sobre la latencia en hardware sm_89.
- Archivo y reproducibilidad de cuantizaciones: el repositorio documenta hash SHA-256 de cada fichero, revision del repositorio de origen y receta de conversion, lo que facilita auditar la cadena de procedencia del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el artefacto `.ninfer` ni para el GGUF `Q8_K_P` del que deriva. El unico dato cuantitativo de rendimiento es el tiempo de conversion a cuantizacion en CUDA: 181,8 segundos, que no es una medida de inferencia.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 19,03 GiB por fichero, por lo que se necesita una GPU con al menos 24 GB para dejar margen a activaciones, cache de atencion y buffers del motor. No cabe en GPUs de 16 GB ni de 12 GB.
- GPU recomendada: una NVIDIA GeForce RTX 4090 (24 GB, sm_89) es el unico objetivo soportado. El motor se ejecuta en un unico dispositivo segun la model card.
- GPU de centro de datos (A100, H100): no disponible; la build publicada esta compilada especificamente para sm_89 y la documentacion no menciona otras arquitecturas.
- Entorno: Linux de 64 bits, CUDA 13.4, GCC 15 y un driver NVIDIA lo bastante reciente para ese toolkit.
- Builds requeridas: `ninfer-serve-46645ada` (arbol `46645ada79a3c603fc8a6bfd3e4c9d194850de13`) para el fichero v2 y `ninfer-serve-v3-322a7f51` (arbol `322a7f51ae24c5a08034f8f2a293cd8e9e83019c`) para el fichero v3. Los contenedores no son intercambiables entre builds.
- Opciones de despliegue: exclusivamente el motor NInfer compilado desde el codigo fuente de la linea `ninfer-4090`. No hay soporte para vLLM, llama.cpp, Ollama, TGI, LM Studio ni Text Generation Inference.
- Latencia y throughput: no disponible. La model card no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Almacenamiento: 40,9 GB para el repositorio completo, o 19,03 GiB si se descarga un unico fichero de contenedor.

## Comparativa con modelos similares

Comparativa con los artefactos directamente relacionados de los que se dispone de informacion. No se dispone de datos de benchmarks de ninguno de ellos, por lo que la comparacion se limita a formato, cuantizacion y licencia.

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Motor de inferencia |
|---|---|---|---|---|---|---|
| ttindall/Qwen3.8-27B-Uncensored-HauhauCS-NInfer | 27B (denominacion) | No disponible | `.ninfer` v2 y v3 | Groupwise Q4/Q5/Q6 + W8G32_F16S | apache-2.0 | NInfer (sm_89, RTX 4090) |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF | 27B (denominacion) | No disponible | GGUF | Q8_K_P entre otras | No disponible | llama.cpp y compatibles con GGUF |
| Qwen/Qwen3.8-27B (checkpoint de referencia) | 27B (denominacion) | No disponible | safetensors BF16 | BF16 | No disponible | transformers, vLLM y compatibles |

No se dispone de informacion sobre modelos alternativos de la misma categoria (tamano y tarea) con la que ampliar esta tabla.

## Limitaciones y advertencias

- Compatibilidad nula fuera de NInfer: el contenedor `.ninfer` no carga en transformers, vLLM, llama.cpp ni LM Studio, y las dos generaciones de contenedor (v2 y v3) requieren binarios distintos y no intercambiables.
- Hardware restringido: solo se ha compilado para sm_89 (RTX 4090) con CUDA 13.4 y GCC 15. No hay builds publicadas para otras arquitecturas de GPU.
- Modelo declarado sin censura: HauhauCS reporta 0/465 rechazos en su conjunto de prueba y el perfil Aggressive responde directamente a consignas duras. Puede generar contenido que otros modelos rechazan, con el consiguiente riesgo legal, reputacional y de seguridad si se despliega sin filtros externos.
- Ausencia total de evaluacion: sin benchmarks publicados no es posible estimar la calidad frente a alternativas, ni detectar degradacion introducida por la recuantizacion a groupwise Q4/Q5/Q6.
- Riesgo de alucinacion: no cuantificado ni documentado en la informacion disponible.
- Idiomas soportados sin declarar: el repositorio no especifica cobertura linguistica, por lo que el comportamiento multilingue es indeterminado.
- Procedencia del tune: los pesos no provienen del checkpoint oficial de Qwen, sino del tune de un tercero (HauhauCS), y la licencia apache-2.0 declarada en este repositorio no exime de verificar los terminos aplicables al modelo base y al tune de origen.
- Redistribucion de pesos de vision desde el checkpoint de referencia Qwen/Qwen3.8-27B, copiados de forma literal segun la model card.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y su fecha de creacion es el 13 de octubre de 2026, por lo que no existe retroalimentacion de terceros sobre su funcionamiento real.
- Los ficheros deben verificarse con los SHA-256 publicados antes de su uso; cualquier discrepancia invalida el artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ttindall/Qwen3.8-27B-Uncensored-HauhauCS-NInfer
- Modelo base (GGUF): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Checkpoint de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor NInfer para RTX 4090: https://github.com/sergiuszm/ninfer-4090
- Companero DFlash2: `z-lab/Qwen3.8-27B-DFlash2` (referenciado en la model card como revision `50307d4c4cde6860d4eee73e2547cd786fe8e8a4`)
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su arquitectura o sus resultados; los unicos resultados obtenidos no guardan relacion con el contenido de esta ficha.
