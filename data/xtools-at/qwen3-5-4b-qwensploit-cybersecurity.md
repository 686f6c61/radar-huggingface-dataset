# xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity

## Resumen

Qwensploit 3.5 4B es un ajuste fino (fine-tune) orientado a ciberseguridad sobre un merge de la familia Qwen3.5-4B, publicado por el usuario xtools-at en Hugging Face. El modelo parte de `xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic`, un merge que combina destilación de razonamiento, código y razonamiento multi-paso, y se entrena mediante LoRA supervisado sobre 7.000 ejemplos de cuatro conjuntos de datos centrados en razonamiento de seguridad, red team y destilaciones sintéticas.

El objetivo declarado es asistir en investigación de seguridad, análisis de vulnerabilidades, revisión de código seguro, modelado de amenazas, ejercicios de red team autorizados y retos CTF, además de preguntas y respuestas técnicas y asistencia de programación. Con 4.539.265.536 parámetros totales y una ventana de entrenamiento de 8.192 tokens, se posiciona como un modelo de tamaño medio que puede ejecutarse en hardware de una sola GPU.

Es relevante ahora porque combina tres tendencias: los fine-tunes verticales de dominio (ciberseguridad), el uso de datos destilados de modelos mayores y las variantes "uncensored" que relajan los rechazos del modelo base. La licencia declarada es Apache-2.0, aunque el propio autor advierte que deben revisarse las licencias upstream antes de redistribuir o usar comercialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajuste fino con LoRA sobre un merge; pipeline declarado image-text-to-text |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8.192 tokens (longitud de contexto usada en entrenamiento) |
| Tipos de cuantizacion | no disponible en la model card; existe un repositorio GGUF publicado por el mismo autor |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (sujeta a revisión de compatibilidad con licencias upstream) |
| Formato de pesos | safetensors (repositorio de 9,1 GB); variante GGUF en repositorio separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5, con 4B parámetros, sobre el que se aplica un ajuste fino LoRA. El modelo base directo es un merge de tres vías (`Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic`) que combina destilaciones de razonamiento de Claude Opus, código y razonamiento multi-paso, además de una variante "heretic" que reduce los comportamientos de rechazo. El pipeline declarado en Hugging Face es image-text-to-text, aunque la model card no documenta capacidades de visión ni detalles sobre el componente multimodal.

El entrenamiento consistió en una época de SFT con LoRA (r=16, alpha=32, dropout=0.02, todos los módulos objetivo), optimizador AdamW de 8 bits, learning rate 2e-4 con scheduler lineal, weight decay 0.002 y batch efectivo 4x8 sobre una NVIDIA A100 de 40 GB. Se usaron 7.000 ejemplos de entrenamiento (máximo 8.000 caracteres por entrada) y 350 de evaluación, mezclados y barajados: CyberSec-Reasoning-Premium (33%), RedTeam-Premium (34%), Claude Mythos Distilled 25K Clean (20%) y Qwen3.8-Max Distillation 50K Clean (13%). La pérdida final reportada es 0,524 en entrenamiento y 0,532 en evaluación.

## Capacidades

- Generación de texto y razonamiento técnico orientado a seguridad, con énfasis en explicaciones paso a paso.
- Análisis de vulnerabilidades y revisión de código seguro.
- Conocimiento de red team: técnicas ofensivas, reconocimiento y explotación en entornos autorizados.
- Resolución de retos CTF y asistencia en educación en seguridad.
- Generación y explicación de código, incluyendo código de scripting y herramientas de seguridad.
- Preguntas y respuestas técnicas multi-turno en inglés.
- Comportamiento "uncensored"/"heretic": menor tendencia a rechazar peticiones, incluidas las de temática ofensiva.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modelo base incluye datos de razonamiento multi-paso.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking explícito, visión o audio: no documentados en la model card.

## Casos de uso

- Revisión de código seguro en CI/CD: el modelo puede analizar diffs o fragmentos de código en busca de patrones inseguros (inyección, deserialización, gestión de secretos) y proponer correcciones, integrándose como paso de revisión asistida en pipelines.
- Modelado de amenazas: dado un diagrama o descripción de arquitectura, generar listas de amenazas, superficies de ataque y contramedidas, aprovechando los datos de razonamiento de seguridad del entrenamiento.
- Ejercicios de red team autorizados: apoyar la planificación de pruebas de penetración (enumeración, vectores plausibles, comandos de ejemplo) en entornos con autorización explícita, gracias a su entrenamiento en red team.
- Formación y CTF: generar explicaciones de técnicas, pistas graduales y writeups para retos de captura de la bandera, útil en entornos educativos.
- Triaje de incidentes: resumir logs y alertas, proponer hipótesis de compromiso y pasos de contención, con la advertencia de validar cada recomendación.
- Asistente de investigación de vulnerabilidades: ayudar a interpretar CVEs, describir clases de vulnerabilidad y esbozar pruebas de concepto en laboratorio.
- Asistencia de programación general: generación de scripts de automatización y utilidades de seguridad en Python y shell, dado el componente de código del modelo base.
- Despliegue local en estaciones de trabajo: al ser un modelo de 4B, puede ejecutarse en una GPU de consumo para tareas de consulta offline en entornos air-gapped.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento: pérdida de entrenamiento 0,524 y pérdida de evaluación 0,532 (paso 219), con la evolución por pasos:

| Metrica | Paso 48 | Paso 96 | Paso 144 | Paso 192 | Paso 219 |
|---|---:|---:|---:|---:|---:|
| Training loss | 0,695 | 0,699 | 0,546 | 0,530 | 0,524 |
| Evaluation loss | 0,700 | 0,604 | 0,558 | 0,537 | 0,532 |

El propio autor advierte que la pérdida es un diagnóstico de entrenamiento y no una medida de precisión en ciberseguridad ni de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9-10 GB solo para pesos, más overhead de KV cache; en la práctica, 12-16 GB para contextos moderados.
- Cuantización a 8 bits: en torno a 5-6 GB de pesos; a 4 bits: en torno a 3 GB de pesos, con margen adicional para el contexto.
- GPU recomendadas: NVIDIA A100 40 GB (usada en entrenamiento), H100, L40S o A10G para servicio; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16 sin problemas.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) en cuantización 8 bits y en tarjetas de 8 GB con cuantización 4 bits.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama a través del repositorio GGUF del mismo autor, y servidores compatibles con endpoints (el tag `endpoints_compatible` sugiere despliegue gestionado); vLLM y TGI no están documentados explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit 3.5 4B (este) | 4,54B | 8.192 (entrenamiento) | Ciberseguridad, red team, uncensored | Apache-2.0 (revisar upstream) | Hugging Face, safetensors y GGUF |
| Qwensploit 3.5 2B | no disponible | no disponible | Ciberseguridad, misma familia | Apache-2.0 (según colección) | Hugging Face |
| Qwensploit 3.5 9B | no disponible | no disponible | Ciberseguridad, misma familia | Apache-2.0 (según colección) | Hugging Face |
| Qwen3.5-4B (base de familia) | ~4B | no disponible en esta ficha | Modelo generalista | según Qwen | Hugging Face |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con otros fine-tunes de ciberseguridad en la información proporcionada.

## Limitaciones y advertencias

- Puede generar explicaciones inexactas, código inseguro o consejos de seguridad desactualizados; el autor recomienda validar toda salida.
- Los datos de destilación sintética pueden contener errores heredados de los modelos profesor.
- El rendimiento en tareas de seguridad del mundo real no ha sido establecido de forma independiente.
- Uso ofensivo restringido a entornos con autorización explícita; el modelo no incorpora salvaguardas fuertes al ser una variante "uncensored"/"heretic".
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Contexto de entrenamiento de 8.192 tokens; no se documenta extensión de contexto en inferencia.
- Licencia Apache-2.0 declarada, pero el autor advierte que las licencias upstream (modelo base y dataset de destilación Qwen) deben revisarse antes de redistribuir o usar comercialmente.
- Riesgo de alucinación en detalles técnicos (nombres de CVE, flags de herramientas, versiones) que deben verificarse contra fuentes primarias.
- Sesgos: no documentados; al entrenarse principalmente con datos sintéticos y de seguridad, puede sobrerrepresentar técnicas ofensivas y descuidar contexto defensivo o normativo.
- El pipeline declarado image-text-to-text no está respaldado por documentación de capacidades de visión; conviene tratarlo con cautela en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwensploit-3.5-4B-Qwensploit-CyberSecurity (URL canónica: https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity)
- Variante GGUF: https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity-GGUF
- Colección Qwensploit / Cybersec: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic
- Merge relacionado: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong
- Familia Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset RedTeam-Premium: https://huggingface.co/datasets/saidutta69/RedTeam-Premium
- Dataset Claude Mythos Distilled 25K Clean: https://huggingface.co/datasets/saidutta69/claude-mythos-distilled-25k-clean
- Dataset Qwen3.8-Max Distillation 50K Clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Fuente upstream Cybersecurity Reasoning Dataset: https://huggingface.co/datasets/dpevzner/Cybersecurity_Reasoning_Dataset
- Fuente upstream Ultimate Offensive Red Team: https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Fuente upstream claude_mythos_distilled_25k: https://huggingface.co/datasets/WithinUsAI/claude_mythos_distilled_25k
- Fuente upstream qwen3.8-max-distillation-50k: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k
- Variantes de la familia: https://huggingface.co/xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity y https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity
