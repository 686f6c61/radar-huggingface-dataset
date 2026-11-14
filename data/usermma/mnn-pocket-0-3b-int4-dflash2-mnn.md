# usermma/MNN-Pocket-0.3B-INT4-DFlash2-MNN

## Resumen

MNN-Pocket-0.3B INT4 + DFlash2 (combined) es un paquete de despliegue publicado por el usuario usermma que empaqueta, en un unico directorio listo para ejecutar, el modelo objetivo taobao-mnn/MNN-Pocket-0.3B cuantizado a INT4 en formato MNN junto con su modulo de decodificacion especulativa DFlash2 (taobao-mnn/MNN-Pocket-0.3B-DFlash2). No se trata de un modelo entrenado desde cero, sino de una exportacion reproducible generada con la herramienta `llmexport.py` del repositorio alibaba/MNN, pensada para el runtime de decodificacion especulativa de MNN.

El modelo objetivo es un transformer Qwen3ForCausalLM de 28 capas, dimension oculta 896 y vocabulario de 65536 tokens, lo que situa el total en torno a los 0,3 mil millones de parametros. El borrador DFlash2 es un modelo auxiliar de 3 capas que propone bloques de B = 8 tokens por pasada y comparte el embedding de tokens y la LM head del modelo objetivo, de modo que el coste anadido en memoria es minimo.

Su relevancia practica esta en la inferencia en dispositivo (edge y movil): el paquete completo ocupa unos 0,2 GB y permite ejecutar generacion de texto con decodificacion especulativa sobre CPU mediante MNN, con una aceleracion reportada por el autor de 1,65x en iPad Pro (M5) y 1,15x en Snapdragon 8 Gen 5 frente al mismo objetivo INT4 sin borrador. La licencia Apache-2.0 heredada de los repositorios de origen facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM) para el objetivo; DFlash2DraftModel de 3 capas para el borrador |
| Parametros totales | Aproximadamente 0,3 mil millones (objetivo); el borrador anade un modulo auxiliar de 3 capas |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 (W4, tamano de bloque 64) para objetivo y borrador |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache-2.0 (heredada de los repositorios upstream taobao-mnn) |
| Formato de pesos | MNN (`llm.mnn` / `llm.mnn.weight`, `dflash.mnn` / `dflash.mnn.weight`, `dflash_fc.mnn`, `dflash_kvmat.mnn`); los originales upstream estan en safetensors BF16 |
| Capas del objetivo | 28 |
| Dimension oculta | 896 |
| Vocabulario | 65536 tokens |
| Capas del borrador | 3 |
| Tamano de bloque especulativo | B = 8 |
| Capas objetivo usadas por el borrador | [1, 7, 13, 19, 25] |
| Token de mascara DFlash | 65521 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo objetivo sigue la arquitectura Qwen3ForCausalLM: un transformer decoder-only de 28 capas con dimension oculta 896 y vocabulario de 65536 tokens. El modulo de decodificacion especulativa DFlash2 es un borrador de 3 capas que propone un bloque completo de 8 tokens por pasada de borrador, en lugar de un unico token, y reutiliza el embedding de tokens y la LM head del objetivo (configurado mediante `dflash_shared_lmhead_input: /final_layernorm/Mul_1_output_0`). El borrador incorpora ademas un modulo de compresion de caracteristicas (`dflash_fc`) y un proyector KV por capa (`dflash_kvmat`), y toma representaciones de las capas 1, 7, 13, 19 y 25 del objetivo.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si documenta la model card es el proceso de exportacion: los pesos BF16 en safetensors de taobao-mnn/MNN-Pocket-0.3B y taobao-mnn/MNN-Pocket-0.3B-DFlash2 se descargaron sin modificar y se convirtieron con `transformers/llm/export/llmexport.py` de alibaba/MNN (commit b6a32165e2855106b76852fba80793d58a829663, clon superficial de master del 2026-11-14) usando pymnn 3.6.2 para la conversion ONNX a MNN, con `--quant_bit 4`. La innovacion tecnica destacable es la decodificacion especulativa por bloques con LM head compartida, que reduce el coste de memoria del borrador a unos 15 MB en INT4 mas los modulos auxiliares. El cargador del borrador desactiva el modo thinking porque perjudica la tasa de aceptacion del borrador en Qwen3.

## Capacidades

- Generacion de texto autoregresiva en ingles con el modelo objetivo de 0,3 mil millones de parametros.
- Decodificacion especulativa por bloques de 8 tokens mediante el borrador DFlash2, con verificacion y rollback en el runtime MNN.
- Inferencia en CPU sobre x86-64 y, segun los datos upstream, sobre dispositivos ARM moviles (iPad Pro M5, Snapdragon 8 Gen 5).
- Ejecucion en un unico directorio sin ensamblaje manual: el runtime MNN lee `config.json` y carga objetivo y borrador de forma automatica.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues mas alla del ingles.
- El modo thinking de Qwen3 queda desactivado por el cargador del borrador DFlash.

## Casos de uso

- Asistentes de texto embebidos en aplicaciones moviles: el paquete de 0,2 GB y la inferencia en CPU con MNN permiten integrar un generador de texto en apps iOS y Android sin depender de la nube, con la decodificacion especulativa reduciendo la latencia percibida.
- Autocompletado y sugerencias en editores o teclados: el modelo cabe en memoria de dispositivos moviles y la generacion por bloques de 8 tokens encaja con la produccion de continuaciones cortas de baja latencia.
- Clasificacion y etiquetado de texto en el dispositivo: tareas de resumen corto, extraccion de entidades o categorizacion donde la privacidad exige no enviar datos a servidores externos.
- Prototipado y evaluacion de decodificacion especulativa: el repositorio sirve como referencia reproducible para medir la tasa de aceptacion y el speedup de DFlash2 en hardware propio antes de adoptar el runtime.
- Sistemas de respuesta en tiempo real con restricciones de red: entornos industriales, automocion o dispositivos IoT con conectividad intermitente donde un modelo local de 0,3B cubre respuestas conversacionales basicas.
- Investigacion sobre inferencia eficiente en edge: comparar el rendimiento del objetivo INT4 con y sin borrador (la model card documenta la ejecucion AR baseline con las claves especulativas eliminadas) para estudiar el equilibrio entre coste del borrador y ganancia de velocidad segun el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento documentados son de velocidad de decodificacion:

| Medicion | Valor | Contexto |
|---|---|---|
| Decodificacion AR baseline (objetivo INT4, sin borrador) | 52,5 tok/s | VM x86-64 de pruebas del autor |
| Speedup DFlash2 vs. objetivo INT4 | 1,65x de media | iPad Pro (M5), dato reportado por upstream |
| Speedup DFlash2 vs. objetivo INT4 | 1,15x | Snapdragon 8 Gen 5, dato reportado por upstream |
| Estabilidad | 96/96 tokens sin errores | Multiples rondas de borrador, verificacion y rollback |
| Speedup en VM x86-64 debil | Puede ser inferior a 1x | El coste del borrador puede superar el beneficio |

## Requisitos de hardware

- VRAM y memoria: el paquete completo ocupa 0,2 GB en disco (163 MB de pesos del objetivo INT4, 15 MB del borrador, 16 MB del modulo fc y 380 KB del proyector KV), por lo que la huella en memoria es del orden de cientos de MB, apta para dispositivos moviles.
- GPU recomendadas: no se documenta ejecucion en GPU; la verificacion del autor se realizo con una build de CPU x86-64. Los datos upstream de speedup corresponden a SoC ARM (Apple M5, Snapdragon 8 Gen 5).
- GPU de consumo: no hay datos publicados sobre ejecucion en RTX 4090 u otras GPU de consumo; el runtime objetivo es MNN en CPU.
- Opciones de despliegue: MNN compilado con `-DMNN_BUILD_LLM=ON -DMNN_LLM_BUILD_DEMO=ON -DMNN_SUPPORT_TRANSFORMER_FUSE=ON -DMNN_LOW_MEMORY=ON`, ejecutando `llm_demo` contra el `config.json` del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que los pesos estan en formato MNN.
- Latencia y throughput: 52,5 tok/s de decodificacion en la VM x86-64 de prueba con el objetivo INT4 sin borrador; con DFlash2, 1,65x en iPad Pro (M5) y 1,15x en Snapdragon 8 Gen 5 segun upstream, con posible degradacion en hardware x86 debil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B INT4 + DFlash2 (este repositorio) | ~0,3B | No disponible | MNN, CPU, decodificacion especulativa | Apache-2.0 | Paquete combinado objetivo + borrador, 0,2 GB |
| taobao-mnn/MNN-Pocket-0.3B | ~0,3B | No disponible | Safetensors BF16 (upstream) | Apache-2.0 (segun upstream) | Modelo objetivo sin borrador; requiere exportacion propia |
| taobao-mnn/MNN-Pocket-0.3B-DFlash2 | Borrador de 3 capas | No disponible | Safetensors BF16 (upstream) | Apache-2.0 (segun upstream) | Solo el modulo de decodificacion especulativa |
| Otros modelos de ~0,3B para edge | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos de benchmarks en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no se documentan capacidades multilingues.
- Con 0,3 mil millones de parametros, la calidad en razonamiento complejo, matematicas y codigo es limitada en comparacion con modelos de mayor tamano; no hay benchmarks publicados que permitan cuantificarla.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, agravado por la cuantizacion INT4.
- La longitud de contexto no esta documentada, lo que impide planificar casos de uso con conversaciones largas o documentos extensos.
- La aceleracion de la decodificacion especulativa depende del dispositivo: en hardware x86 debil el coste del borrador puede superar el beneficio, como advierte el propio autor.
- El modo thinking de Qwen3 esta desactivado por el cargador del borrador, por lo que no se puede aprovechar esa capacidad del modelo base.
- Los pesos estan en formato MNN y requieren el runtime de alibaba/MNN; no son directamente utilizables en ecosistemas como transformers, vLLM o llama.cpp sin conversion adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la verificacion se limita a una build x86-64 de CPU; no hay validacion independiente publicada.
- La licencia Apache-2.0 se hereda de los repositorios upstream; conviene revisar `LICENSE.txt` y las condiciones de los modelos de origen antes de un uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/usermma/MNN-Pocket-0.3B-INT4-DFlash2-MNN
- Modelo objetivo upstream: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Borrador DFlash2 upstream: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-DFlash2
- Runtime MNN: https://github.com/alibaba/MNN
- Herramienta de exportacion: `transformers/llm/export/llmexport.py` en alibaba/MNN (commit b6a32165e2855106b76852fba80793d58a829663)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
