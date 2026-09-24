# Wherebot101/Prompt-Enhancers-INT8-ConvRot-Qwen-Image-2.1

## Resumen

Este repositorio publica dos checkpoints de aumento de prompts (*prompt enhancers*) cuantizados a INT8 mediante la técnica ConvRot, derivados de la familia Qwen Image 2.1. No se trata de checkpoints de difusión ni de codificadores de texto para condicionamiento de imagen, sino de modelos de reescritura de prompts: la variante T2I expande un prompt de texto y la variante I2I expande una instrucción de edición a partir de imágenes de referencia. Ambos devuelven texto estructurado pensado para ser parseado en un prompt reescrito y un consejo de relación de aspecto.

El autor, Wherebot101, no ha reentrenado ni aplicado ablación adicional: se limita a convertir los tensores BF16 de dos derivados de la comunidad (pottokao para T2I y darrellbest para I2I) con la herramienta `quant_int8_convrot.py` de Comfy-Org, incluyendo explícitamente la cabeza de salida y cuantizando también el *embedding* de tokens. Cada checkpoint contiene 310 paquetes de pesos cuantizados y ocupa aproximadamente 9,47 GB, con un repositorio total de 19 GB.

Su relevancia es operativa más que de investigación: permite ejecutar estos *prompt enhancers* en flujos de ComfyUI con la mitad de precisión que los originales BF16, siempre que el *runtime* soporte de forma nativa la arquitectura del enhancer de Qwen Image 2.1 y la carga de SafeTensors INT8/ConvRot. La licencia Qwen Research restringe el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Prompt enhancer derivado de Qwen Image 2.1 (pipeline image-text-to-text); detalle de capas y mecanismos de atencion no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (pesos int8; tensores pequeños y no matriciales conservan su precision original). No se distribuyen GGUF ni BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License (`license: other`, `license_name: qwen-research`), uso no comercial |
| Formato de pesos | safetensors (INT8/ConvRot) |
| Variantes incluidas | T2I (`t2i/model.int8_convrot.safetensors`) e I2I (`i2i/model.int8_convrot.safetensors`) |
| Tamano por checkpoint | ~9,47 GB (310 paquetes de pesos cuantizados cada uno) |
| Tamano del repositorio | 19,0 GB |
| Modelos base | pottokao/Qwen-Image-2.1-PE-T2I-Heretic y darrellbest/Qwen-Image-2.1-PE-I2I-Heretic |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-24 |

## Arquitectura y entrenamiento

No hay reentrenamiento ni ajuste adicional: la contribución del autor es exclusivamente una conversión de precision. Los tensores BF16 de los modelos base se procesaron con `quant_int8_convrot.py` del repositorio Comfy-Org/comfy-model-tools (revision `1846ff1a`), con la cabeza `lm_head` incluida de forma explícita mediante `--include '^lm_head$'` y cuantizacion por defecto sin recorte MSE (*non-MSE-clipped*). El *embedding* de tokens tambien esta cuantizado. Un lector externo aporta los shards indexados originales y las matrices de gran tamaño se procesan en lotes de filas para ajustarse a una GPU de 16 GB.

El resultado son checkpoints INT8/ConvRot que no son shards BF16 ordinarios de Transformers ni ficheros GGUF, por lo que requieren un *runtime* con soporte nativo de la arquitectura de prompt enhancer de Qwen Image 2.1 y de la carga de SafeTensors INT8/ConvRot. Cada carpeta de tarea incluye su tokenizer, processor, configuracion, plantilla de chat y el fichero `system_prompt.txt` obligatorio. Los autores de los modelos base describen sus derivados como Heretic/abliterated, pero esta conversion no verifica de forma independiente esas afirmaciones de comportamiento, ni se realizo ninguna ablacion adicional.

## Capacidades

- Reescritura de prompts de texto a imagen (T2I): expande una indicacion breve en un prompt detallado.
- Expansion de instrucciones de edicion con imagenes de referencia (I2I): toma una o mas imagenes y una orden de edicion y genera la instruccion ampliada.
- Salida de texto estructurado: devuelve JSON con el prompt reescrito y consejo sobre la relacion de aspecto recomendada.
- Razonamiento intermedio: el modelo genera texto de razonamiento antes de la respuesta final; ese texto intermedio no debe interpretarse como el prompt final.
- Entrada multimodal en la variante I2I: procesa caracteristicas visuales (se valido la coincidencia exacta de las features de vision en las pruebas del autor).
- No hay soporte descrito de *tool calling*, *function calling*, uso como agente ni razonamiento multi-paso general.
- No hay informacion disponible sobre cobertura multilingue.

## Casos de uso

- Aumento de prompts en ComfyUI (T2I): cargar `t2i/model.int8_convrot.safetensors` en el *slot* nativo de prompt-enhancement, usar el `system_prompt.txt` de la carpeta T2I y parsear el JSON de salida para alimentar el checkpoint de difusion con un prompt enriquecido.
- Expansion de instrucciones de edicion en ComfyUI (I2I): usar la variante I2I con una o varias imagenes de referencia para convertir una orden escueta ("cambia el fondo") en una instruccion de edicion detallada y coherente con la imagen de entrada.
- Preprocesado por lotes en pipelines de generacion de imagen: dado que cada checkpoint ocupa ~9,47 GB en INT8, es viable mantener el enhancer residente junto al modelo de difusion en GPUs de 16-24 GB y encadenar generaciones sin recargar pesos.
- Estandarizacion de prompts en equipos de diseño: centralizar la reescritura de indicaciones para que todas las peticiones de un proyecto pasen por la misma formulacion, reduciendo la variabilidad entre operadores.
- Asesoramiento de composicion: explotar el campo de consejo de relacion de aspecto de la salida para seleccionar resoluciones coherentes con el encuadre descrito antes de lanzar la generacion.
- Reduccion de huella de memoria frente a BF16: desplegar la version INT8 como alternativa al derivado BF16 cuando la VRAM es el cuello de botella, aceptando la perdida de precision propia de la cuantizacion sin recorte MSE.
- Verificacion de integridad en despliegues propios: usar `conversion.json`, que registra revisiones upstream inmutables, revision del conversor y checksums SHA-256 de salida y de los tensores, para auditar que el checkpoint desplegado corresponde al publicado.
- Evaluacion comparativa de variantes: mantener T2I e I2I como dos servicios separados y comparar sus salidas sobre el mismo conjunto de casos, recordando que cada instruccion debe emparejarse con su modelo correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La validacion descrita por el autor es de compatibilidad, no de calidad: ambos checkpoints cargaron y se ejecutaron en la implementacion nativa de Comfy y en una implementacion nativa independiente; para los casos T2I seleccionados y un caso I2I con una referencia, los tokens de entrada capturados, los *embeddings*, los estados ocultos de prefill y nueve vectores de puntuaciones de salida coincidieron exactamente, y las *features* de vision de I2I tambien. Cada comparacion ejecuto 128 pasos de decodificacion con *teacher forcing*. Las ejecuciones muestreadas independientes devolvieron JSON final valido con prompts reescritos y consejo de aspecto. El propio autor advierte que esto no constituye una evaluacion amplia de calidad, ni un estudio de comportamiento de rechazo, ni una comparacion BF16 frente a INT8.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 9,47 GB solo para los pesos de cada checkpoint, mas el *overhead* de activaciones, KV cache y, en la variante I2I, el procesamiento de vision. Con precision INT8, un presupuesto practico de 11-14 GB es razonable, aunque no hay mediciones publicadas.
- La conversion se realizo en una GPU de 16 GB, por lo que ese es el minimo documentado para manipular los tensores, no necesariamente para servirlos.
- GPU recomendadas: no hay lista publicada. Por tamano de pesos, encajan tarjetas de 16 GB o mas (RTX 4080, RTX 4070 Ti Super, RTX 4090, A100 40/80 GB, H100). Cabe en GPU de consumo de gama alta, siempre que el *runtime* sea compatible.
- Opciones de despliegue: exclusivamente *runtimes* con soporte nativo de la arquitectura de prompt enhancer de Qwen Image 2.1 y carga de SafeTensors INT8/ConvRot. En ComfyUI debe usarse el *slot* nativo de prompt-enhancement, no el de codificador de texto de generacion de imagen. Estos ficheros no son shards BF16 de Transformers ni GGUF, por lo que vLLM, llama.cpp, Ollama y TGI no son opciones validas tal cual.
- Latencia y throughput: no disponible.
- Nota de memoria: la conversion uso procesamiento por lotes de filas para matrices grandes, lo que indica que el pico de memoria durante la conversion supera el de la inferencia normal.

## Comparativa con modelos similares

| Modelo | Precision / formato | Tamano | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (T2I) | INT8 ConvRot, safetensors | ~9,47 GB | Reescritura de prompts T2I | Qwen Research (no comercial) | HuggingFace, 0 descargas |
| Este repositorio (I2I) | INT8 ConvRot, safetensors | ~9,47 GB | Expansion de instrucciones I2I con vision | Qwen Research (no comercial) | HuggingFace, 0 descargas |
| pottokao/Qwen-Image-2.1-PE-T2I-Heretic | BF16 (fuente) | no disponible | Reescritura de prompts T2I | no disponible | HuggingFace |
| darrellbest/Qwen-Image-2.1-PE-I2I-Heretic | BF16 (fuente) | no disponible | Expansion de instrucciones I2I | no disponible | HuggingFace |

No hay datos de parametros, contexto ni rendimiento comparado publicados para ninguna de las variantes, por lo que la comparacion se limita al formato, el tamaño y la licencia. La ventaja declarada de esta conversion es la reduccion de footprint a INT8; la contrapartida es la perdida de precision asociada a una cuantizacion sin recorte MSE y la dependencia de un *runtime* especifico.

## Limitaciones y advertencias

- Licencia Qwen Research: uso no comercial. Cualquier despliegue comercial requiere revisar `LICENSE` y `Notice` y, en su caso, negociar condiciones con el titular de los derechos.
- No es un checkpoint de difusion ni un codificador de texto de condicionamiento de imagen; usarlo en ese *slot* de ComfyUI producira resultados incorrectos.
- No es un shard BF16 estandar ni un GGUF: sin un *runtime* compatible con INT8/ConvRot no se puede cargar.
- Los autores de los modelos base describen sus derivados como Heretic/abliterated. Esta conversion no verifica de forma independiente esas afirmaciones, por lo que no debe asumirse ningun comportamiento de rechazo concreto.
- La validacion se limita a coincidencia exacta en casos seleccionados (T2I elegidos y un I2I con una referencia) y 128 pasos de decodificacion forzada; no es una evaluacion de calidad, de sesgos ni de rechazo.
- No se ha realizado un estudio comparativo BF16 frente a INT8, por lo que se desconoce la degradacion real de calidad introducida por la cuantizacion.
- La cuantizacion se hizo sin recorte MSE y afecta tambien al *embedding* de tokens y a `lm_head`, lo que puede amplificar errores en la salida final.
- El texto de razonamiento intermedio no es el prompt final; parsearlo como tal rompe el flujo previsto.
- Cada tarea requiere su `system_prompt.txt`, su tokenizer y su processor correspondientes; mezclar los recursos de T2I e I2I invalida el resultado.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento fuera del ingles.
- No se conocen sesgos especificos, al no haberse publicado evaluaciones al respecto.
- El modelo no ha sido evaluado para *tool calling* ni para uso como agente; no debe emplearse en esos escenarios.
- Riesgo de alucinacion no cuantificado: es un reescritor de prompts y puede introducir elementos no presentes en la indicacion original.
- 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wherebot101/Prompt-Enhancers-INT8-ConvRot-Qwen-Image-2.1
- Modelo base T2I: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-T2I-Heretic
- Modelo base I2I: https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-I2I-Heretic
- Herramientas de conversion: https://github.com/Comfy-Org/comfy-model-tools/tree/1846ff1a9c3212e12b0edf8347c493651854b80e
- Ficheros de licencia y aviso legal: `LICENSE` y `Notice` dentro del repositorio
- Registro de conversion con checksums: `conversion.json` dentro del repositorio
