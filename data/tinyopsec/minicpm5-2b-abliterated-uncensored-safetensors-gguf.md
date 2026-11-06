# tinyopsec/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-GGUF

## Resumen

MiniCPM5-2B-Abliterated-Uncensored-Safetensors-GGUF es una colección de cuantizaciones GGUF del modelo MiniCPM5-2B, publicado por el usuario tinyopsec en Hugging Face. El modelo base es openbmb/MiniCPM5-2B, un modelo de lenguaje de aproximadamente 2,5 mil millones de parámetros basado en la arquitectura Llama, desarrollado por OpenBMB. Esta variante concreta procede del repositorio 0xSojalSec/MiniCPM5-2B-Abliterated-Uncensored-Safetensors, al que se ha aplicado un proceso de "abliteration", una técnica que modifica los pesos del modelo para suprimir sus mecanismos internos de rechazo, eliminando las negativas de seguridad sin necesidad de reentrenamiento.

El problema que resuelve esta ficha de modelos es doble: por un lado, ofrece el modelo en formato GGUF para su ejecución local eficiente en CPU y GPU de consumo mediante llama.cpp y runtimes compatibles; por otro, proporciona una versión sin filtros de alineación para usuarios que necesitan respuestas sin rechazos. La relevancia actual de los modelos abliterated radica en la demanda de modelos locales personalizables para investigación, red-teaming y casos donde los rechazos estándar resultan restrictivos.

El repositorio incluye trece cuantizaciones, desde F16 (5,0 GB) hasta Q2_K, con un tamaño total del repositorio de 24,6 GB. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder) |
| Parametros totales | 2.516.756.480 (~2,52 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el repositorio de origen abliterated |

## Arquitectura y entrenamiento

El modelo base, openbmb/MiniCPM5-2B, emplea la arquitectura Llama (transformer decoder unidireccional) con aproximadamente 2,52 mil millones de parámetros, según los metadatos de safetensors del repositorio. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO u otras técnicas de alineación del modelo base no están disponibles en la información proporcionada.

La innovación principal de esta variante no está en la arquitectura sino en el post-procesado: la abliteration es una técnica que identifica las direcciones de "rechazo" en el espacio de activaciones del modelo y las suprime ortogonalizando los pesos, de modo que el modelo deja de generar negativas de seguridad. No requiere entrenamiento adicional y preserva en gran medida las capacidades originales del modelo. Las cuantizaciones GGUF se han producido con llama.cpp, lo que permite ejecutar el modelo desde 2 bits (Q2_K) hasta precisión completa (F16).

## Capacidades

- Generacion de texto conversacional: el modelo está etiquetado con el pipeline text-generation y orientado a uso conversacional.
- Ejecucion local eficiente: gracias al formato GGUF, funciona en CPU, GPU y configuraciones híbridas mediante llama.cpp.
- Respuestas sin rechazos: al ser abliterated, no aplica sus mecanismos de negativa por seguridad, lo que lo hace adecuado para pruebas de seguridad y red-teaming.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no están documentados en el repositorio.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; es un modelo de solo texto.

## Casos de uso

- Investigacion en alineacion y seguridad: al ser un modelo abliterated, permite estudiar el comportamiento de LLMs sin filtros, analizar qué tipos de contenido genera sin salvaguardas y evaluar técnicas de mitigación.
- Red-teaming y auditoria de sistemas: puede usarse como modelo adversario para probar la robustez de filtros de contenido y sistemas de moderación en aplicaciones en producción.
- Experimentacion local en hardware de consumo: con la cuantización Q4_K_M (~1,5-2 GB estimados), cabe en GPUs de consumo modestas o incluso en portátiles solo con CPU, ideal para prototipado rápido sin coste de API.
- Integracion en aplicaciones locales con Ollama o LM Studio: el formato GGUF permite desplegarlo en entornos offline o con privacidad estricta (datos que no pueden salir del dispositivo), como asistentes de escritorio.
- Generacion de datasets sinteticos sin restricciones: útil para investigadores que necesitan generar ejemplos de contenido sensible (por ejemplo, para entrenar clasificadores de seguridad) donde los modelos alineados se niegan.
- Estudio de la degradacion por cuantizacion: la disponibilidad de trece niveles de cuantización (F16 a Q2_K) lo hace adecuado para comparar la pérdida de calidad en función del nivel de compresión.
- Chatbots personales offline: como modelo conversacional de 2,5B, puede alimentar asistentes de bajo consumo en dispositivos con recursos limitados, aunque con capacidades inferiores a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones en MMLU, HumanEval, GSM8K ni otras pruebas comparativas, ni del modelo base ni de las cuantizaciones abliterated.

## Requisitos de hardware

- VRAM/CPU RAM estimada para inferencia (tamaños de archivo GGUF, aproximados):
  - F16: 5,0 GB
  - Q8_0: ~2,7 GB
  - Q6_K: ~2,1 GB
  - Q5_K_M: ~1,8 GB
  - Q4_K_M: ~1,5-1,6 GB
  - Q3_K_M: ~1,3 GB
  - Q2_K: ~1,0 GB
  (valores no Q4_K_M estimados a partir de la proporción habitual de tamaños; solo F16 está confirmado en la model card)
- GPU recomendadas: por su tamaño reducido, cualquier GPU moderna con 4 GB de VRAM o más ejecuta cómodamente Q4_K_M; una RTX 3060 de 12 GB o una RTX 4060 sobran incluso para F16 en modo GPU offload parcial.
- Cabe en consumer GPUs: sí, sin problema; incluso en GPUs de gama baja (4 GB) con cuantizaciones de 4 bits, y en CPU pura con 8 GB de RAM usando Q4_K_M o inferior.
- Opciones de despliegue: llama.cpp (llama-cli, ejemplo documentado en la model card), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI (orientados a safetensors, no GGUF).
- Latencia y throughput estimados: no disponible; al ser un modelo de 2,5B cuantizado, se espera generación rápida en GPU (decenas de tokens/s) y velocidad aceptable en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Abliterated | Contexto |
|---|---|---|---|---|---|
| MiniCPM5-2B-Abliterated (este) | ~2,52 B | GGUF (13 cuantizaciones) | Apache 2.0 | Sí | no disponible |
| openbmb/MiniCPM5-2B (base) | ~2,52 B | safetensors | Apache 2.0 | No | no disponible |
| Qwen2.5-3B-Instruct | 3 B | safetensors, GGUF (comunidad) | Qwen license (uso comercial condicionado) | No | 32.768 tokens |
| Llama-3.2-3B-Instruct | 3,21 B | safetensors, GGUF (comunidad) | Llama 3.2 Community License | No | 131.072 tokens |

Frente a sus alternativas de tamaño similar, este modelo destaca por la licencia Apache 2.0 sin restricciones y por la versión abliterated; a cambio, carece de documentación de contexto largo y de benchmarks publicados, y las variantes alineadas de Qwen y Llama suelen ofrecer mejor rendimiento documentado y soporte de ecosistema.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: genera contenido sin las salvaguardas de seguridad originales. Su uso para producir contenido dañino, ilegal o nocivo puede infringir la ley; la propia model card advierte de usarlo de forma responsable y conforme a la legislación aplicable.
- Riesgo de alucinacion: no evaluado en el repositorio; como todo LLM de 2,5B, es probable que alucine con frecuencia, especialmente en tareas de razonamiento y hechos específicos.
- Degradacion por abliteration: la abliteration puede reducir la calidad general y la capacidad de seguimiento de instrucciones respecto al modelo base; no hay evaluaciones que cuantifiquen esta pérdida.
- Degradacion por cuantizacion: cuantizaciones agresivas (Q3, Q2_K) implican pérdida de calidad notable; la model card recomienda Q4_K_M.
- Idiomas y contexto: ni los idiomas soportados ni la longitud de contexto están documentados, lo que dificulta planificar aplicaciones multilingües o con documentos largos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar los términos del modelo base openbmb/MiniCPM5-2B.
- Advertencia para produccion: al carecer de benchmarks, moderación integrada y documentación de contexto, no se recomienda para entornos de producción sin evaluación propia previa y capas externas de moderación de contenido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio de origen abliterated (safetensors): no disponible como URL directa; referenciado en la model card como `0xSojalSec/MiniCPM5-2B-Abliterated-Uncensored-Safetensors`
- Paper, blog o demo: no disponible
