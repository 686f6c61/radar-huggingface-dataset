# zelusmeetai/Ministral-3-3B-Instruct-2512-Q4_0-GGUF

## Resumen

Ministral-3-3B-Instruct-2512-Q4_0-GGUF es una cuantizacion en formato GGUF del modelo Mistral AI Ministral-3-3B-Instruct-2512, publicada por el usuario zelusmeetai. No se trata de un modelo nuevo, sino de una conversion a precision Q4_0 pura (sin K-quants) del checkpoint oficial en BF16, pensada especificamente para el backend Qualcomm Hexagon (NPU) de llama.cpp y para autotests en GPU que requieren pesos en bloques Q4_0. El modelo base es un transformer denso de 3.429.006.336 parametros (aproximadamente 3,4 mil millones) con licencia Apache-2.0.

La relevancia de esta publicacion es practica: el repositorio oficial de Mistral solo distribuye BF16, Q4_K_M, Q5_K_M y Q8_0, formatos que no son compatibles con el backend Hexagon de llama.cpp. Esta version cubre ese hueco manteniendo los embeddings de tokens y la capa de salida en Q8_0 y las normas en F32, lo que preserva parte de la fidelidad numerica a costa de un tamano de archivo de 2.139.109.536 bytes (unos 2,1 GB).

Al ser una cuantizacion del modelo Instruct de Mistral, hereda las capacidades conversacionales y de instrucciones del original, pero la model card no aporta informacion sobre el contexto, los idiomas o los datos de entrenamiento. La ficha se limita, por tanto, a lo verificable en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del modelo base Mistral AI) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 pura en pesos de bloque; token_embd y output en Q8_0; normas en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un unico archivo de 2.139.109.536 bytes) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Ministral-3-3B-Instruct-2512 de Mistral AI, un transformer denso de 3,4 mil millones de parametros. Esta publicacion no reentrena ni modifica la arquitectura: solo aplica cuantizacion. El proceso se realizo con `llama-quantize` de la release b12359 de llama.cpp, a partir del archivo BF16 oficial (`Ministral-3-3B-Instruct-2512-BF16.gguf`, SHA-256 `17ef932bea952e007f9dad63151da5699132ec513d1033d618df7382e24aa3ee`) del repositorio `mistralai/Ministral-3-3B-Instruct-2512-GGUF` en el commit `eb599d408350ea2bb60452cb86be7c7b2fc28227`.

El comando empleado fue `llama-quantize --pure --token-embedding-type q8_0 --output-tensor-type q8_0 ... Q4_0`, sin imatrix. El flag `--pure` impide mezclar K-quants con cuantizaciones legacy, de modo que todos los pesos de bloque quedan en Q4_0. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF/DPO del modelo original en la informacion proporcionada. El SHA-256 del archivo resultante es `c7da75b7ef88ab2e83cb5065b92d8e2c01aa2a8453738fb86140e970da17c014`.

## Capacidades

- Generacion de texto conversacional en modo chat: la model card indica el uso con `llama-cli -m ... -cnv`, lo que activa el modo conversacional de llama.cpp.
- Seguimiento de instrucciones: al derivar del modelo Instruct de Mistral, conserva el comportamiento ajustado para instrucciones del original.
- Inferencia en dispositivo (on-device): el tag `on-device` y el soporte del backend Hexagon apuntan a despliegue en hardware movil o embebido con NPU Qualcomm.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con infraestructura de inferencia tipo endpoint HTTP.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling, agentes, vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia en dispositivos con NPU Qualcomm Hexagon: el formato Q4_0 puro es el unico que acepta el backend Hexagon de llama.cpp, por lo que este GGUF permite ejecutar el modelo en telefonos o placas con esa NPU sin reconvertir pesos.
- Prototipado local en portatiles con GPU de consumo: con 2,1 GB de pesos, el modelo cabe en GPUs con 4-6 GB de VRAM y permite pruebas de chat sin infraestructura dedicada.
- Chat conversacional de bajo coste: el modo `-cnv` de llama.cpp permite desplegar un asistente de texto con una sola linea de comando, util para demos y entornos de desarrollo.
- Autotest de GPUs y validacion de builds de llama.cpp: la model card menciona que el archivo se genero tambien para un autotest de GPU, por lo que sirve como caso de prueba reproducible con hash conocido.
- Evaluacion comparativa de cuantizaciones: al existir versiones oficiales Q4_K_M, Q5_K_M y Q8_0, este Q4_0 permite medir la perdida de calidad frente a K-quants en el mismo modelo base.
- Integracion en pipelines CI/CD de modelos: el tamano reducido y el hash fijado permiten usarlo como artefacto de prueba en validaciones automatizadas de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB solo para los pesos; con overhead de contexto y buffers de llama.cpp, el consumo real sera superior (no cuantificado en la informacion disponible).
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano, cualquier GPU con al menos 4 GB de VRAM deberia poder cargar los pesos.
- GPU de consumo: si, el tamano de 2,1 GB permite ejecucion en GPUs de consumo con suficiente VRAM libre, aunque no se detalla que modelos concretos.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), backend Qualcomm Hexagon (NPU) de llama.cpp, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512-Q4_0-GGUF (este) | 3,43 B | no disponible | Q4_0 pura + Q8_0 emb/output | Apache-2.0 | Hugging Face |
| Ministral-3-3B-Instruct-2512-GGUF (oficial) | 3,43 B | no disponible | BF16, Q4_K_M, Q5_K_M, Q8_0 | Apache-2.0 | Hugging Face |
| Ministral-3-3B-Instruct-2512 (BF16) | 3,43 B | no disponible | BF16 | Apache-2.0 | Hugging Face |

La diferencia clave frente al repositorio oficial es la cuantizacion Q4_0 pura, necesaria para el backend Hexagon y para determinados autotests de GPU, a cambio de renunciar a los K-quants, que suelen ofrecer mejor calidad por bit.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: cualquier limitacion del modelo base (sesgos, alucinaciones, calidad en dominios concretos) se hereda integra.
- La cuantizacion Q4_0 sin imatrix puede degradar la calidad respecto a Q4_K_M o Q5_K_M, especialmente en tareas de razonamiento o codigo.
- No se dispone de informacion sobre longitud de contexto, idiomas soportados ni datos de entrenamiento en la model card de esta publicacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre el archivo.
- Aunque la licencia es Apache-2.0, se recomienda verificar los terminos del modelo base de Mistral AI para uso comercial en produccion.
- El autor indica que todos los creditos corresponden a Mistral AI; este repositorio solo cambia la cuantizacion.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/zelusmeetai/Ministral-3-3B-Instruct-2512-Q4_0-GGUF
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Repositorio GGUF oficial: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-GGUF
- Commit de origen del BF16: `eb599d408350ea2bb60452cb86be7c7b2fc28227`
- Herramienta de cuantizacion: llama.cpp release b12359 (`llama-quantize`)
