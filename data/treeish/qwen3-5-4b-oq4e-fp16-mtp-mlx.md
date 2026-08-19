# treeish/Qwen3.5-4B-oQ4e-FP16-MTP-MLX

## Resumen

El modelo `treeish/Qwen3.5-4B-oQ4e-FP16-MTP-MLX` es una variante en precisión FP16 del paquete cuantizado `treeish/Qwen3.5-4B-oQ4e-MTP-MLX`, desarrollado por el usuario treeish. Está diseñado específicamente para ejecutarse en Macs con chips M1 y M2 mediante el runtime MLX Swift de Treeish, donde la aritmética FP16 evita la dependencia de BF16, que no está soportada de forma nativa en esos procesadores. El modelo base es `Qwen/Qwen3.5-4B`, un modelo denso de visión-lenguaje de 4 mil millones de parámetros, con una ventana de contexto de 262 144 tokens.

Esta versión conserva todos los componentes del paquete original: pesos cuantizados con oQ4e (cuantización mixta de 4, 5 y 6 bits mejorada con imatrix), torre de visión completa, cabecera de predicción multi-token (MTP) embebida, tokenizador y plantilla de chat corregida. La única diferencia es que los tensores que originalmente estaban en BF16 se han convertido a FP16, lo que no altera el tamaño en disco (3.3 GB) ni el uso de memoria. El paquete incluye 1 250 tensores indexados, de los cuales 297 pertenecen a la torre de visión y 29 a la capa MTP.

La relevancia de este modelo radica en ofrecer una alternativa de alta calidad para inferencia local en hardware Apple de generaciones anteriores, manteniendo capacidades avanzadas como tool calling, procesamiento de imágenes y generación de texto con contexto muy largo, todo en un paquete de solo 3.3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denso vision-language (transformer) con cabecera MTP embebida |
| Parametros totales | 1 057 525 248 (según safetensors; el modelo base declara 4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | oQ4e: 4-bit affine con group size 64, overrides por tensor de 5 y 6 bits, mejorado con imatrix |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del modelo base `Qwen/Qwen3.5-4B`, un transformer denso de 4 mil millones de parámetros con capacidades multimodales (visión y lenguaje). La arquitectura incluye una torre de visión completa (297 tensores) y una capa de predicción multi-token (MTP) embebida bajo `language_model.mtp.*`, que permite anticipar varios tokens futuros durante la generación para acelerar la inferencia.

La cuantización oQ4e aplica una precisión mixta: por defecto 4-bit affine con group size 64, pero con overrides por tensor de 5 y 6 bits para capas sensibles, y está mejorada con imatrix (matriz de importancia) para reducir la pérdida de calidad. El paquete FP16 se obtuvo convirtiendo los 994 tensores BF16 originales a FP16, preservando los 256 tensores empaquetados en `uint32` y copiando byte a byte los 16 archivos no ponderados. No se dispone de información sobre el entrenamiento original del modelo base (datos, tokens, RLHF, etc.), ya que la model card solo documenta el proceso de conversión y cuantización.

## Capacidades

- Generación de texto y razonamiento: modelo de lenguaje de 4B con contexto de 262 144 tokens, capaz de mantener conversaciones largas y coherentes.
- Procesamiento de imágenes: al ser un modelo vision-language, puede recibir imágenes como entrada y generar respuestas basadas en su contenido.
- Tool calling / function calling: validado con una llamada `search_text` correctamente parseada, lo que indica soporte para invocación de herramientas.
- Predicción multi-token (MTP): capa embebida que permite generar varios tokens por paso, mejorando el throughput en hardware compatible.
- Multilingüismo: no especificado en la documentación, aunque los modelos Qwen suelen ser multilingües; no se confirma.
- Compatibilidad con Sprig: integrado con el runtime de Treeish para edición de texto estructurada (formato de edición de cadena exacta).

## Casos de uso

- Asistente local con visión en Macs M1/M2: el modelo puede analizar imágenes y responder preguntas sobre ellas, todo en local sin conexión, gracias a su tamaño reducido y compatibilidad con Apple Silicon.
- Generación de código con contexto largo: su ventana de 262 144 tokens permite procesar repositorios completos o archivos de gran tamaño, y su soporte de tool calling facilita la integración en pipelines de desarrollo.
- Automatización de atención al cliente: con tool calling y contexto largo, puede gestionar conversaciones multi-turno, consultar bases de conocimiento externas y generar respuestas precisas.
- Edición de documentos estructurados: mediante Sprig, puede realizar ediciones exactas en texto, útil para tareas de transformación de documentos o corrección automática.
- Prototipado de agentes conversacionales: su tamaño compacto y licencia Apache 2.0 permiten experimentar con agentes que combinan visión, texto y llamadas a herramientas en hardware modesto.
- Inferencia en entornos con memoria limitada: al ocupar solo 3.3 GB y requerir 16 GB de RAM unificada, es viable en portátiles Mac de gama de entrada, habilitando aplicaciones de IA local en equipos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de velocidad de generación de una prueba interna de Treeish en un M4 Max de 36 GB:

- Sin MTP: 100.2 tokens/s (fixture calentado de 1 066 tokens).
- Con MTP (bloques 2, 3 y 4): 95.3, 91.9 y 89.9 tokens/s respectivamente.
- Comparación FP16 vs BF16 sin MTP: 100.0 tokens/s vs 98.8 tokens/s.

Estas cifras corresponden a una máquina concreta y a un fixture pequeño, por lo que no deben considerarse representativas del rendimiento general del modelo.

## Requisitos de hardware

- Memoria unificada: Treeish utiliza este modelo desde 16 GB de RAM unificada; el margen real depende de la longitud de contexto, configuración de caché y otras aplicaciones en ejecución.
- GPU: diseñado para Apple Silicon (M1, M2, M3, M4). La variante FP16 está pensada para M1 y M2; los M3 y superiores pueden usar el paquete BF16 original.
- VRAM estimada: el tamaño del repo es de 3.3 GB, pero el uso en memoria puede ser mayor según el contexto y la caché; no se especifica un valor exacto.
- Opciones de despliegue: runtime MLX Swift de Treeish (validado), compatible con el ecosistema MLX. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: en el M4 Max de prueba, ~100 tokens/s sin MTP; en M1/M2 se espera menor rendimiento, aunque no se proporcionan datos.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información facilitada.

## Limitaciones y advertencias

- Cuantización de baja precisión: el uso de oQ4e (4-bit con overrides de 5/6 bits) implica una pérdida de calidad respecto al modelo original en BF16/FP16, especialmente en tareas de razonamiento complejo.
- Compatibilidad de runtime: solo está validado con el runtime MLX Swift de Treeish; otros runtimes deben soportar los overrides de cuantización por tensor y el layout MTP embebido, lo que puede limitar su portabilidad.
- Rendimiento variable: las cifras de velocidad reportadas provienen de una única máquina (M4 Max) y no son representativas de todos los entornos.
- Sin información de entrenamiento: no se documentan los datos de entrenamiento del modelo base, por lo que no se pueden evaluar sesgos o limitaciones lingüísticas específicas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o no verificado; la cuantización puede aumentar este riesgo.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar la atribución de los componentes adicionales (Froggeric, MTPLX) que también declaran Apache 2.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/treeish/Qwen3.5-4B-oQ4e-FP16-MTP-MLX
- Modelo base (BF16): https://huggingface.co/treeish/Qwen3.5-4B-oQ4e-MTP-MLX
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio MTPLX: https://github.com/youssofal/MTPLX
