# xbill9/gemma-4-E2B-it-qat-q4_0-fp8-text-emb4

## Resumen
Esta ficha describe un build no oficial del modelo Gemma 4 E2B-it publicado por el usuario xbill9 en Hugging Face. No es un modelo entrenado desde cero, sino una conversion de los pesos de `google/gemma-4-E2B-it-qat-q4_0-unquantized` a un formato cuantizado en FP8 E4M3 (W8A8) con embeddings y `lm_head` en int4, empaquetado para su ejecucion en vLLM mediante compressed-tensors. El checkpoint resultante ocupa 3,40 GiB y el repositorio completo 3,7 GB.

Gemma 4 es la familia abierta de Google DeepMind que cubre cinco tamanos (E2B, E4B, 12B, 26B A4B y 31B), con arquitecturas densas y MoE segun el tamano, ventana de contexto de hasta 256K tokens y soporte de mas de 140 idiomas. E2B es la variante mas ligera, pensada para ejecucion local en presupuestos de memoria ajustados. Los pesos base emplean entrenamiento consciente de cuantizacion (QAT) sobre una rejilla de 4 bits con una escala por grupo de 32.

El interes de este build es doble: por un lado reduce el peso a FP8 para acelerar la inferencia en vLLM, y por otro ilustra un caso practico de reconversion de pesos QAT a un esquema de cuantizacion distinto. El autor advierte de que la conversion es no oficial, que el modelo es solo texto (se descarta la entrada de imagen del modelo base multimodal) y que los problemas deben reportarse al autor, no a Google.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; la documentacion de la familia menciona variantes densas y MoE, pero no se especifica el subtipo de E2B en la informacion disponible) |
| Parametros totales | 5.031.222.563 (5,03 B, segun safetensors) |
| Parametros activos | no aplica (no se indica que este build sea MoE) |
| Longitud de contexto | hasta 256K tokens segun la documentacion de la familia Gemma 4; no especificado para E2B en la informacion disponible |
| Tipos de cuantizacion | FP8 E4M3 W8A8 en 276 modulos Linear (1.876.819.968 valores cuantizados); embeddings y `lm_head` en int4 |
| Idiomas soportados | mas de 140 idiomas segun la documentacion de Gemma 4; no especificado para esta conversion, que ademas es solo texto |
| Licencia | gemma (terminos de uso de Gemma) |
| Formato de pesos | safetensors con compressed-tensors (disenado para vLLM) |

## Arquitectura y entrenamiento
El modelo base pertenece a Gemma 4, que segun la documentacion oficial combina arquitecturas densas y de mezcla de expertos (MoE) segun el tamano, con soporte de razonamiento, contexto largo, system prompts y uso nativo de herramientas. E2B corresponde a la variante mas pequena de la familia; su prefijo "E" alude a parametros efectivos, mientras que el recuento total de safetensors asciende a 5,03 B, coherente con tablas de embeddings de gran tamano. Los pesos originales fueron entrenados con QAT sobre 4 bits con una escala por grupo de 32.

Este build aplica una conversion distinta: almacena cada capa Linear como FP8 E4M3 con una escala float32 por canal de salida y cuantiza las activaciones a FP8 por token en tiempo de ejecucion (esquema `float-quantized` de compressed-tensors). Como FP8 con una escala por canal de salida no puede representar las escalas por grupo del QAT, los pesos se redondean de nuevo y, ademas, se cuantizan las activaciones. El autor reporta un error RMS relativo del 2,64 % frente a los pesos QAT y un error maximo del 3,57 % respecto al mayor valor de su fila. La conversion se realizo con el script `fp8_text.py` incluido en el repositorio y sin datos de calibracion. Los embeddings y el `lm_head` se toman sin cambios del build `-emb4` en int4, con el `lm_head` desacoplado (untied).

## Capacidades
- Generacion de texto y conversacion multi-turno, heredadas de la variante instruct (it) del modelo base.
- Razonamiento y resolucion de tareas de lenguaje natural; la familia Gemma 4 documenta capacidades de razonamiento y codigo.
- Uso nativo de herramientas (tool calling) y de system prompts, segun la documentacion de la familia Gemma 4.
- Ejecucion mediante compressed-tensors en vLLM, lo que habilita servidores de inferencia con batching continuo.
- Soporte multilingue heredado de la familia (mas de 140 idiomas), aunque no verificado especificamente en esta conversion.
- Limitacion explicita del build: solo texto; la entrada de imagen del modelo base multimodal no esta disponible en esta version.
- Ejecucion en memoria reducida gracias a FP8 en los modulos Linear y a embeddings en int4.

## Casos de uso
- Despliegue local de un asistente conversacional: con 3,40 GiB de checkpoint en FP8 y un modelo efectivo de ~2B, puede servirse en una GPU de consumo para chat multi-turno con contexto largo.
- Servidor de inferencia vLLM para equipos pequenos: el formato compressed-tensors permite batching continuo y aprovechar kernels FP8, reduciendo el coste por token frente al modelo base sin cuantizar.
- RAG sobre documentacion interna: la ventana de contexto de la familia (hasta 256K tokens) permite inyectar muchos fragmentos recuperados y mantener conversaciones con historial extenso.
- Clasificacion, extraccion y resumen de texto en pipelines por lotes: al ser un modelo ligero solo texto, encaja en tareas de procesamiento masivo donde la latencia importa menos que el coste.
- Prototipado de agentes con tool calling: el soporte nativo de herramientas de Gemma 4 permite conectar el modelo a APIs y ejecutar flujos multi-paso.
- Asistencia de codigo en entornos con recursos limitados: util para autocompletado y explicacion de fragmentos, aunque sin las garantias de un modelo especializado en codigo.
- Despliegue en hardware con soporte FP8 para reducir el uso de VRAM frente a los pesos sin cuantizar, manteniendo una degradacion medida por el autor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado por el autor es la fidelidad de la conversion:

| Metrica | Valor |
|---|---|
| Modulos Linear en FP8 | 276 |
| Valores cuantizados | 1.876.819.968 |
| Error RMS relativo frente a los pesos QAT | 2,64 % |
| Error maximo (fraccion del mayor valor de su fila) | 3,57 % |
| Tamano del checkpoint | 3,40 GiB |

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint ocupa 3,40 GiB, por lo que los pesos en FP8 caben holgadamente; con activaciones y cache KV la cifra practica se situa aproximadamente entre 5 y 8 GB en contextos moderados, y crece con la longitud de contexto (estimacion, no confirmada por el autor).
- GPU recomendadas: se recomienda hardware con soporte nativo de FP8, es decir, generaciones Ada Lovelace (RTX 40xx), Hopper (H100) o posteriores, ya que vLLM aprovecha kernels FP8 especificos.
- GPU de consumo: cabe en tarjetas con 8-12 GB o mas; una RTX 4090 o 4080 es suficiente para contextos normales. En Ampere y anteriores el soporte de FP8 W8A8 en vLLM es mas limitado y puede requerir kernels alternativos.
- Contexto largo: cargar la ventana completa de 256K tokens exige VRAM adicional significativa para la cache KV; en GPU de consumo conviene limitar el contexto.
- Opciones de despliegue: el modelo esta empaquetado especificamente para vLLM mediante compressed-tensors (`library_name: vllm`). No se indica compatibilidad con llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| xbill9/gemma-4-E2B-it-qat-q4_0-fp8-text-emb4 | 5,03 B totales | FP8 E4M3 W8A8 + embeddings int4 | hasta 256K (familia Gemma 4) | gemma | Solo texto, conversion no oficial, 3,40 GiB |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | mismo modelo base | QAT en 4 bits (por grupo de 32), sin reconversion | hasta 256K (familia Gemma 4) | gemma | Modelo base multimodal del que deriva este build; mayor peso |
| Gemma 4 E4B | no disponible | QAT disponible (builds oficiales) | hasta 256K (familia Gemma 4) | gemma | Variante superior de la familia, mas capacidad a cambio de mas memoria |

Como alternativa de otros fabricantes con tamano y enfoque similares (por ejemplo, modelos de ~2B efectivos de otras familias) no se dispone de datos comparables en la informacion proporcionada.

## Limitaciones y advertencias
- Conversion no oficial: no esta publicada por Google y los problemas deben reportarse al autor, no a Google.
- Solo texto: no admite entrada de imagen, a diferencia del modelo base multimodal.
- Perdida de fidelidad: el autor reporta un error RMS relativo del 2,64 % y un error maximo del 3,57 % respecto a los pesos QAT, consecuencia de reconvertir pesos entrenados con una rejilla de 4 bits a un esquema FP8 por canal de salida.
- Sin datos de calibracion: la cuantizacion de activaciones se hizo sin conjunto de calibracion, lo que puede afectar a la calidad en dominios alejados de la distribucion de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones especificas para esta conversion.
- Sesgos: no se documentan sesgos concretos en la informacion disponible, pero se heredan los del modelo base Gemma 4.
- Idiomas: aunque la familia declara soporte de mas de 140 idiomas, no se ha verificado el comportamiento multilingue de esta conversion concreta.
- Licencia: se rige por los terminos de Gemma; es responsabilidad del usuario revisar las condiciones de uso comercial antes de desplegarlo.
- Despliegue: el soporte esta ligado a vLLM y compressed-tensors; no se documenta compatibilidad con otros runtimes.
- Rendimiento real: al no publicarse benchmarks, conviene validar el modelo en el caso de uso concreto antes de llevarlo a produccion.

## Enlaces
- Repositorio del modelo: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-fp8-text-emb4
- Modelo base sin cuantizar: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized/tree/main
- Pagina de Gemma 4 en Hugging Face: https://huggingface.co/google/gemma-4-E2B
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Build QAT de Gemma 4 E2B en LM Studio: https://lmstudio.ai/models/google/gemma-4-e2b-qat
