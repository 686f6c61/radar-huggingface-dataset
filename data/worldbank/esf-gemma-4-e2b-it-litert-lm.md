# worldbank/esf-gemma-4-E2B-it-litert-lm

## Resumen

El modelo `worldbank/esf-gemma-4-E2B-it-litert-lm` es una adaptación del modelo base `google/gemma-4-E2B-it` (de la familia Gemma 4 de Google DeepMind), fine-tuneado con LoRA sobre documentación del Marco Ambiental y Social (ESF) del Banco Mundial y exportado al formato `.litertlm` para ejecución en dispositivos Android mediante el runtime LiteRT-LM. El objetivo es ofrecer una herramienta de consulta y asistencia técnica sobre políticas ambientales y sociales del Banco Mundial que funcione íntegramente en el dispositivo, sin conexión a servidores.

Se trata de un modelo de 2.100 millones de parámetros (según la ficha del modelo base en gemma4.dev), con una ventana de contexto de 8.000 tokens y cuantización `dynamic_wi8_afp32`. El artefacto final pesa 2,39 GB, lo que lo hace viable para su despliegue en teléfonos de gama media y alta. Aunque el checkpoint base es multimodal, esta exportación elimina los encoders de visión y audio, dejando únicamente la torre de texto, por lo que no acepta entradas de imagen ni sonido. El modelo está pensado para casos de uso en campo, auditorías y consultas legales donde el acceso a internet no está garantizado.

La relevancia de este modelo radica en su enfoque vertical: en lugar de un asistente genérico, ofrece respuestas especializadas en el ESF, un corpus normativo complejo que requiere conocimiento experto. Al estar optimizado para CPU y Android, democratiza el acceso a esta información en entornos con recursos limitados, alineándose con la misión del Banco Mundial de promover el desarrollo sostenible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Gemma 4 E2B, modelo base) |
| Parametros totales | 2.100 millones (modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.000 tokens (según ficha del modelo base) |
| Tipos de cuantizacion | dynamic_wi8_afp32 |
| Idiomas soportados | No disponible (el modelo base Gemma 4 soporta múltiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | No disponible en los metadatos; el modelo base usa la licencia Gemma de Google |
| Formato de pesos | LiteRT-LM (.litertlm) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un checkpoint de 2.100 millones de parámetros diseñado para ejecución en dispositivos de borde. La arquitectura subyacente es un transformer denso con atención estándar, optimizado para baja latencia en CPU. Sobre este checkpoint se aplicó un fine-tune con LoRA (Low-Rank Adaptation) utilizando material del Marco Ambiental y Social del Banco Mundial, lo que permite adaptar el comportamiento del modelo a un dominio específico sin modificar todos los pesos. Posteriormente, los pesos LoRA se fusionaron con el modelo base y se exportó al formato `.litertlm` mediante un proceso de empaquetado en AWS SageMaker Processing.

No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición exacta del dataset ni el número de épocas. Tampoco se menciona el uso de técnicas como RLHF o DPO. El proceso de exportación siguió la referencia de `litert-community/gemma-4-E2B-it-litert-lm`, pero eliminando los encoders de visión y audio del modelo base, ya que el fine-tune se centró exclusivamente en la torre de texto. Esta decisión reduce el tamaño del artefacto final y evita incluir pesos no entrenados que no aportarían valor al dominio ESF.

## Capacidades

- Generación de texto especializada en el Marco Ambiental y Social (ESF) del Banco Mundial, incluyendo estándares de desempeño, políticas de salvaguarda y requisitos de cumplimiento.
- Razonamiento textual sobre normativas y procedimientos, gracias a la capacidad base de Gemma 4 para tareas de comprensión y análisis.
- Funcionamiento completamente offline en dispositivos Android, sin necesidad de conexión a internet.
- Ejecución en CPU, sin requerir GPU o aceleradores dedicados.
- Soporte para conversaciones multi-turno dentro de la ventana de contexto de 8.000 tokens.
- No soporta tool calling, function calling, ni capacidades de agente (no documentadas en la información disponible).
- No soporta entrada de imágenes ni audio (encoders deshabilitados en la exportación).

## Casos de uso

- Consulta de estándares del ESF en campo: un inspector ambiental puede preguntar "¿Qué requisitos aplican para la reubicación involuntaria en proyectos de infraestructura?" y obtener una respuesta precisa basada en el marco normativo, sin conexión a internet.
- Asistencia en auditorías de cumplimiento: auditores de proyectos financiados por el Banco Mundial pueden verificar cláusulas específicas del ESF durante inspecciones en ubicaciones remotas, usando el modelo en una tableta o teléfono Android.
- Formación de personal local: organizaciones no gubernamentales y agencias gubernamentales pueden desplegar el modelo como herramienta de capacitación interactiva para empleados que necesitan entender las políticas ambientales y sociales.
- Soporte a la redacción de informes de evaluación ambiental: el modelo puede ayudar a estructurar secciones de informes técnicos, sugiriendo lenguaje alineado con los estándares del ESF.
- Verificación de documentos: al recibir un texto de un proyecto, el modelo puede identificar posibles incumplimientos del ESF, aunque sin garantía de exhaustividad.
- Aplicaciones móviles de consulta jurídica: bufetes y consultoras que trabajan con el Banco Mundial pueden integrar el modelo en sus aplicaciones Android para consultas rápidas durante reuniones o negociaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo específico en la información disponible. El modelo base `google/gemma-4-E2B-it` cuenta con evaluaciones propias de Google, pero no se han replicado para la versión fine-tuneada con el ESF. Por tanto, no es posible comparar su rendimiento cuantitativo con otros modelos en tareas generales o específicas del dominio.

## Requisitos de hardware

- El artefacto `.litertlm` pesa 2,39 GB, por lo que requiere al menos 3 GB de almacenamiento libre en el dispositivo.
- Memoria RAM recomendada: 4 GB o superior para una inferencia fluida en CPU.
- GPU: no necesaria; el modelo está optimizado para CPU ARM (Android).
- Dispositivos compatibles: teléfonos y tabletas Android con Android 8.0 o superior (según requisitos típicos de LiteRT-LM).
- Opciones de despliegue: exclusivamente a través del runtime LiteRT-LM en Android. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia estimada: no disponible, pero al ser un modelo de 2.100 millones de parámetros con cuantización de 8 bits en pesos, se espera una generación de entre 5 y 15 tokens por segundo en CPUs móviles modernas (estimación basada en modelos similares, no en datos publicados).

## Comparativa con modelos similares

No se dispone de comparativas publicadas que incluyan este modelo. A modo orientativo, se puede comparar con el modelo base sin fine-tune y con otros modelos on-device de tamaño similar, pero no hay datos de rendimiento específicos para esta versión. La siguiente tabla es una comparación cualitativa basada en información pública del modelo base:

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| google/gemma-4-E2B-it (base) | 2.100 M | 8.000 tokens | Multimodal (texto, imagen, audio) | Gemma (uso comercial permitido con restricciones) | Safetensors, GGUF, etc. |
| worldbank/esf-gemma-4-E2B-it-litert-lm | 2.100 M | 8.000 tokens | Solo texto | No disponible | LiteRT-LM |
| litert-community/gemma-4-E2B-it-litert-lm | 2.100 M | 8.000 tokens | Multimodal (según exportación) | Gemma | LiteRT-LM |

No se incluyen otros modelos comparables porque no hay datos suficientes para una comparación rigurosa.

## Limitaciones y advertencias

- El modelo solo procesa texto; cualquier entrada de imagen o audio fallará. No debe mostrarse una interfaz que permita adjuntar estos tipos de archivo.
- La ventana de contexto de 8.000 tokens puede ser insuficiente para documentos extensos del ESF; en esos casos, será necesario dividir el texto en fragmentos.
- El fine-tune se realizó sobre material específico del ESF, por lo que el modelo puede tener un rendimiento degradado en temas fuera de ese dominio.
- No se han documentado los sesgos del fine-tune; es posible que el modelo refleje las limitaciones y perspectivas del corpus utilizado, que proviene de documentos oficiales del Banco Mundial.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en consultas ambiguas o fuera del corpus de entrenamiento.
- La licencia no está especificada en los metadatos. Aunque el modelo base usa la licencia Gemma de Google, es necesario verificar los términos de uso del artefacto final antes de su distribución comercial.
- No se ha publicado información sobre la calidad del fine-tune (por ejemplo, métricas de precisión en tareas de QA sobre el ESF), por lo que su fiabilidad en producción no está garantizada.
- El modelo está empaquetado únicamente para LiteRT-LM; no se puede ejecutar en otros runtimes sin conversión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/worldbank/esf-gemma-4-E2B-it-litert-lm
- Modelo base google/gemma-4-E2B-it: https://huggingface.co/google/gemma-4-E2B
- Referencia de empaquetado litert-community: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Ficha de Gemma 4 E2B en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
- Documentación de Google AI Edge sobre Gemma 4 y LiteRT-LM: https://developers.google.com/edge/litert-lm/models/gemma-4
- Página oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
