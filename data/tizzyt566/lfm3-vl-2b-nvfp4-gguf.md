# TizzyT566/LFM3-VL-2B-NVFP4-GGUF

## Resumen

LFM3-VL-2B-NVFP4-GGUF es una conversión a formato GGUF del modelo de visión-lenguaje LiquidAI/LFM3-VL-2B-NVFP4, desarrollado por Liquid AI. La conversión ha sido realizada por el usuario TizzyT566 y permite ejecutar el modelo con llama.cpp, incluyendo el modelo de lenguaje cuantizado en NVFP4 y un archivo GGUF independiente para el codificador de visión y su proyector. El modelo base pertenece a la familia LFM (Liquid Foundation Models) de Liquid AI, caracterizada por arquitecturas alternativas al transformer convencional.

El modelo resuelve el problema de ejecutar un modelo multimodal (imagen-texto a texto) compacto en hardware de consumo, gracias a su tamaño reducido (aproximadamente 1,73 mil millones de parámetros) y a la cuantización NVFP4 de 4 bits. Es relevante ahora porque los modelos vision-language pequeños y eficientes están en auge para despliegues locales, y este repositorio facilita su uso en el ecosistema llama.cpp sin necesidad de re-cuantización.

Cabe destacar que el autor incluye un parche temporal de runtime (un binario de llama.cpp para Windows con CUDA) que corrige escalas feed-forward NVFP4 ausentes que provocaban salidas incoherentes o repetitivas. Se trata de una modificación no oficial, pendiente de una corrección upstream en llama.cpp, y debe usarse bajo la propia responsabilidad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language basado en la familia LFM3 de Liquid AI (detalles concretos no disponibles) |
| Parametros totales | 1.728.801.744 (aprox. 1,73 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, pesos originales repackados sin re-cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0, tipo "other") |
| Formato de pesos | GGUF (modelo de lenguaje + GGUF separado de codificador de visión/proyector); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, LFM3-VL-2B de Liquid AI, es un modelo de visión-lenguaje que combina un modelo de lenguaje de la familia LFM3 con un codificador de visión y un proyector que alinea las representaciones visuales con el espacio del modelo de lenguaje. En esta versión GGUF, el modelo de lenguaje conserva los pesos cuantizados en formato NVFP4 (punto flotante de 4 bits), que fueron repackados sin re-cuantización, mientras que el codificador de visión y el proyector se distribuyen en un archivo GGUF independiente.

No se dispone de información pública detallada sobre los datos de entrenamiento, el número de tokens ni los procesos de alineamiento (RLHF, DPO) del modelo base en la información proporcionada. Como innovación técnica destacable en el ámbito del runtime, el repositorio documenta un problema de compatibilidad: las escalas feed-forward del formato NVFP4 no estaban siendo leídas correctamente por llama.cpp, lo que causaba salidas incoherentes; el autor proporciona un binario parcheado de llama-server para Windows con soporte CUDA como solución temporal.

## Capacidades

- Comprensión de imágenes y generación de texto a partir de imágenes y texto (pipeline image-text-to-text)
- Conversación multimodal (etiqueta "conversational" en el repositorio)
- Ejecución local mediante llama.cpp con soporte CUDA en NVIDIA
- Huella de memoria reducida gracias a la cuantización NVFP4 (aprox. 4,4 GB el repositorio completo)
- No consta soporte de tool calling, agentes, audio ni thinking mode en la información disponible

## Casos de uso

- Descripción automática de imágenes en local: dado su tamaño de ~1,7 B de parámetros, puede generar descripciones de imágenes en equipos sin GPU de gama alta, útil para catalogar bibliotecas fotográficas personales.
- Chat multimodal en la propia máquina: mediante llama-server (incluido en el parche del autor) se puede montar un servidor local compatible con la API de llama.cpp para conversar sobre imágenes sin enviar datos a la nube, adecuado para entornos con requisitos de privacidad.
- OCR y extracción de información visual ligera: puede emplearse para leer texto en capturas de pantalla, documentos escaneados o fotografías, integrándolo en scripts locales de procesamiento documental.
- Prototipado de aplicaciones multimodales: al ejecutarse con llama.cpp, es idóneo para experimentar con pipelines de visión-lenguaje antes de escalar a modelos mayores, con iteraciones rápidas en hardware de consumo.
- Asistentes embebidos en dispositivos con GPU NVIDIA de gama media: la cuantización NVFP4 reduce la VRAM necesaria, permitiendo despliegues en estaciones de trabajo y portátiles con RTX de la serie 40.
- Etiquetado y moderación de contenido visual: puede integrarse en flujos de trabajo que clasifiquen o describan imágenes de forma masiva de manera local, evitando costes de API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos NVFP4 (~4 bits) y un total de ~1,73 B de parámetros, el modelo de lenguaje ocupa en torno a 1-1,5 GB; sumando el codificador de visión y el KV cache, es razonable estimar un requisito de aproximadamente 2-4 GB de VRAM (estimación, dato oficial no disponible).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el binario parcheado del autor está compilado para Windows con CUDA. Por la huella reducida, GPUs como la RTX 3060 de 12 GB, RTX 4060 Ti o superiores son más que suficientes.
- Consumer GPU: sí, cabe con holgura en la práctica totalidad de GPUs de consumo modernas con al menos 4 GB de VRAM; también debería ser ejecutable en CPU mediante llama.cpp, aunque sin datos de rendimiento publicados.
- Opciones de despliegue: llama.cpp (formato nativo del repositorio), incluido un llama-server.exe parcheado para Windows con CUDA proporcionado por el autor (runtime_fix.zip). No consta compatibilidad verificada con vLLM, TGI ni Ollama. El parche es una modificación no oficial sin pruebas exhaustivas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Modalidad | Licencia |
|---|---|---|---|---|
| LFM3-VL-2B-NVFP4-GGUF (este) | ~1,73 B | GGUF (NVFP4) | Imagen-texto a texto | LFM Open License v1.0 |
| Qwen2.5-VL-3B-Instruct | ~3 B | Safetensors / GGUF comunitarios | Imagen-texto a texto | Qwen (Apache 2.0 con restricciones en algunos componentes) |
| SmolVLM2 2.2B (HuggingFace) | ~2,2 B | Safetensors / GGUF comunitarios | Imagen-texto a texto | Apache 2.0 |

Frente a alternativas como Qwen2.5-VL-3B o SmolVLM2, este modelo destaca por su cuantización NVFP4 nativa y su integración con la familia LFM de Liquid AI, aunque su ecosistema de runtime es menos maduro (requiere un parche temporal de llama.cpp) y no hay benchmarks publicados en la ficha para comparar rendimiento.

## Limitaciones y advertencias

- El runtime estándar de llama.cpp presenta un problema conocido con las escalas feed-forward NVFP4 de este modelo, que produce salidas incoherentes o repetitivas; es necesario usar el binario parcheado incluido en el repositorio hasta que exista una corrección upstream oficial.
- El binario parcheado es una modificación independiente y no oficial, sin pruebas exhaustivas: su uso conlleva riesgo y no debe integrarse acríticamente en producción.
- La licencia LFM Open License v1.0 es de tipo "other": debe revisarse el texto de la licencia antes de cualquier uso comercial, ya que puede incluir restricciones frente a licencias permisivas como Apache 2.0.
- No hay información publicada sobre idiomas soportados, longitud de contexto ni sesgos específicos del modelo, lo que dificulta evaluar su idoneidad para casos de uso en castellano u otras lenguas.
- Al tratarse de un modelo pequeño (~1,7 B), cabe esperar un riesgo de alucinación superior al de modelos de mayor escala, especialmente en tareas de razonamiento complejo o lectura fina de texto en imágenes.
- Los datos de benchmarks no están disponibles, por lo que no es posible verificar el rendimiento frente a modelos competidores antes de probarlo.

## Enlaces

- Repositorio del modelo GGUF: https://huggingface.co/TizzyT566/LFM3-VL-2B-NVFP4-GGUF
- Modelo base cuantizado (Liquid AI): https://huggingface.co/LiquidAI/LFM3-VL-2B-NVFP4
- Modelo base original (Liquid AI): https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia LFM Open License v1.0: https://huggingface.co/TizzyT566/LFM3-VL-2B-NVFP4-GGUF/blob/main/LICENSE
