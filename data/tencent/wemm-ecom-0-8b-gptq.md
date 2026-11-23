# tencent/WeMM-Ecom-0.8B-GPTQ

## Resumen

WeMM-Ecom-0.8B-GPTQ es la versión cuantizada en GPTQ W4A16 del modelo multimodal WeMM-Ecom-0.8B, desarrollado por WeChat Vision (Tencent). Se trata de un modelo denso de aproximadamente 853 millones de parámetros (852.985.920 según los pesos en safetensors) especializado en comprensión de contenido para comercio electrónico dentro del ecosistema de WeChat, con capacidades generales de visión-lenguaje. Forma parte de una familia que incluye variantes de 0.8B, 2B, 4B, 9B y 35B-A3B.

El modelo resuelve el problema de interpretar de forma fina contenido comercial multimodal: atributos de producto, moderación, OCR, recuperación, grounding y razonamiento sobre imágenes y vídeo. Incorpora un modo de razonamiento híbrido (thinking e instruct) y admite entradas de texto, imagen, multi-imagen y vídeo. Su ventana de contexto alcanza los 262.144 tokens, lo que lo hace adecuado para conversaciones largas y documentos extensos.

La relevancia de esta variante concreta reside en su formato cuantizado de 4 bits en pesos con activaciones de 16 bits, empaquetado en `compressed-tensors`, que reduce el espacio en disco (repo de 1,0 GB) y facilita el despliegue en GPU de gama media mediante vLLM. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 852.985.920 (~0,85B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ W4A16 (4 bits en pesos, 16 bits en activaciones), grupos de 128 con cuantizacion simetrica; disponibles tambien BF16, FP8 y GGUF en la familia |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors empaquetado en formato `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo es un transformer denso multimodal de 0,8B parámetros construido sobre la arquitectura de la familia Qwen3.5, según el tag `qwen3_5`. Combina un codificador visual con el modelo de lenguaje para procesar texto, imágenes, múltiples imágenes y vídeo en una única interfaz conversacional. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esa información no está disponible en los materiales proporcionados.

La innovación técnica destacable de esta variante es la cuantización GPTQ W4A16 con grupos de 128 valores y cuantización simétrica, almacenada en el formato `compressed-tensors`. El codificador visual, la cabeza de salida y determinadas proyecciones sensibles conservan su precisión original, lo que preserva la calidad en las partes más críticas del pipeline. El checkpoint incluye su configuración de cuantización, de modo que vLLM detecta el formato automáticamente al arrancar. El modelo base incorpora un modo de razonamiento híbrido (thinking e instruct).

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes, multi-imagen y vídeo.
- Comprensión fina de contenido de comercio electrónico: atributos de producto, moderación, OCR, recuperación, grounding y razonamiento.
- Modo de razonamiento híbrido: alterna entre respuestas directas (instruct) y cadenas de razonamiento extendidas (thinking).
- Conversación multi-turno con contexto largo de hasta 262.144 tokens.
- Capacidades generales de visión-lenguaje: VQA general, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen, seguimiento de instrucciones y tareas centradas en texto.
- Soporte de streaming en la API compatible con OpenAI servida mediante vLLM.
- Capacidades multilingües limitadas a chino e inglés.
- No se documenta en la información disponible soporte explícito de tool calling ni de function calling.

## Casos de uso

- Catalogación automática de productos: el modelo puede extraer atributos de producto (color, material, categoría, talla) a partir de imágenes y texto de fichas, aprovechando su especialización en atributos de comercio electrónico y su ventana de 262.144 tokens para procesar descripciones extensas.
- Moderación de contenido comercial: análisis de imágenes y textos de anuncios para detectar contenido no permitido, apoyándose en los benchmarks de moderación incluidos en su suite de evaluación de comercio electrónico.
- OCR y extracción de datos de etiquetas y documentos: lectura de etiquetas, facturas y embalajes mediante sus capacidades de OCR y comprensión de documentos, con salida estructurada en conversaciones multi-turno.
- Asistente conversacional de atención al cliente en WeChat: gestión de consultas multi-turno sobre productos con contexto largo, combinando imagen del producto y texto del usuario en una misma conversación.
- Búsqueda y recuperación visual de productos: uso de las capacidades de grounding y recuperación para localizar productos o regiones relevantes en imágenes y responder consultas de búsqueda.
- Análisis de vídeo de producto: procesamiento de vídeos demostrativos o reseñas para generar descripciones, resúmenes o verificar atributos, gracias al soporte de entrada de vídeo.
- Despliegue en infraestructura modesta: al ocupar aproximadamente 1 GB en formato GPTQ, puede servirse en GPU de gama media para prototipos y entornos de desarrollo con vLLM.

## Benchmarks y rendimiento

La model card incluye comparaciones agregadas frente a modelos de tamaño similar, expresadas como diferencias de puntuación media en una escala de 0 a 100. No se proporcionan los valores absolutos por benchmark en el texto disponible (las tablas completas están en imágenes no accesibles). Los datos declarados son:

| Comparacion | Ambito | Diferencia media |
|---|---|---|
| WeMM-Ecom-0.8B vs Qwen3.5-0.8B | Comercio electronico (28 benchmarks, 8 escenarios) | +16,43 puntos |
| WeMM-Ecom-0.8B vs MiniCPM-V-4.7-1B | Comercio electronico (28 benchmarks, 8 escenarios) | +13,03 puntos |
| WeMM-Ecom-0.8B vs Qwen3.5-0.8B | Capacidades generales (64 benchmarks, 8 categorias) | +6,93 puntos |
| WeMM-Ecom-0.8B vs MiniCPM-V-4.7-1B | Capacidades generales (64 benchmarks, 8 categorias) | +1,09 puntos |

No se han publicado en la informacion disponible los resultados absolutos por benchmark (MMLU, HumanEval, GSM8K u otros) ni las cifras especificas de esta variante cuantizada GPTQ frente al checkpoint BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB para los pesos GPTQ W4A16, más el coste de la caché KV; con 262.144 tokens de contexto, la caché KV puede crecer de forma significativa y conviene limitar la longitud efectiva en producción.
- GPU recomendadas: GPU con soporte de `compressed-tensors` en vLLM (>= 0.31.0); tarjetas de gama media como RTX 4090 son suficientes para los pesos, mientras que para contextos muy largos o alto throughput se recomiendan A100 o H100.
- Cabe en GPU de consumo: sí, gracias al tamaño reducido del checkpoint cuantizado; cualquier GPU con al menos unos pocos GB de VRAM libre puede alojar los pesos.
- Opciones de despliegue: vLLM con backend `compressed-tensors` (recomendado por el autor, con API compatible con OpenAI); la familia ofrece también variantes GGUF para llama.cpp/Ollama y BF16/FP8 para otros motores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-0.8B-GPTQ | ~0,85B | 262.144 | Apache 2.0 | GPTQ, BF16, FP8, GGUF (familia) | Especializado en comercio electronico; +16,43 pts vs Qwen3.5-0.8B en e-commerce |
| Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | no disponible | Referencia generalista de tamano similar; superado por WeMM-Ecom en e-commerce y en general |
| MiniCPM-V-4.7-1B | ~1B | no disponible | no disponible | no disponible | Modelo multimodal de tamano similar; superado por WeMM-Ecom en e-commerce y ligeramente en general |

Los datos de contexto, licencia y formatos de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Especialización: el modelo está optimizado para comercio electrónico de WeChat; su rendimiento en dominios ajenos puede ser inferior al de modelos generalistas del mismo tamaño.
- Alucinación: como todo modelo generativo, puede producir descripciones o atributos incorrectos; en catalogación y moderación conviene validar las salidas con reglas o revisión humana.
- Cuantización: la variante GPTQ W4A16 puede presentar una ligera degradación frente al checkpoint BF16, especialmente en tareas sensibles a la precisión numérica (OCR fino, grounding).
- Contexto largo: aunque soporta 262.144 tokens, el coste de memoria de la caché KV crece linealmente con la longitud; en GPU de consumo hay que acotar la ventana efectiva.
- Sesgos: no se documentan en la información disponible los sesgos conocidos del modelo.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio para confirmar términos exactos.
- Producción: requiere vLLM >= 0.31.0 con backend `compressed-tensors`; otros motores pueden no detectar el formato automáticamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GPTQ
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-0.8B-FP8
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Coleccion de la familia WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GPTQ/blob/main/LICENSE
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
