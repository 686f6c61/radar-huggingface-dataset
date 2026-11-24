# Thox-ai/ThoxEdge-RustCoder-0.5B

## Resumen

ThoxEdge-RustCoder-0.5B es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-0.5B-Instruct desarrollado por THOX.ai, orientado a la compleción de código en Rust. Se trata de un LoRA de rango 32 fusionado en los pesos base, entrenado sobre un corpus público de código Rust bajo licencia Apache-2.0 con 74.606 ejemplos filtrados de producción de código. El modelo forma parte de la línea ThoxEdge, pensada para inferencia local en dispositivos de borde dentro del ecosistema THOX (ThoxAir, ThoxMini) y para el nivel más económico de su enrutador ThoxRoute.

Con 494.032.768 parámetros reales (0,5B), el modelo hereda la arquitectura transformer decoder-only de la familia Qwen2 y su tokenizador. Su relevancia radica en ser un ejemplo de especialización vertical de un modelo pequeño para un lenguaje concreto (Rust), con una mejora medida y verificada mediante ejecución real de código en MultiPL-E HumanEval-Rust: 28,21% en modo chat frente al 25,64% del base, sobre 156 problemas compilados y ejecutados.

Es importante subrayar que el propio autor lo describe explícitamente como un modelo de 0,5B que **no** es un buen programador de Rust, sino una medición de delta con el mismo arnés de evaluación. Su utilidad es la compleción barata y local de fragmentos de Rust, no la resolución autónoma de problemas complejos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune LoRA rango 32 fusionado |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 publicado en el repo; safetensors en precisión original |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (`model.safetensors`, 988.097.824 B) y GGUF (`ThoxEdge-RustCoder-0.5B-q8_0.gguf`, 531.675.904 B) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, tomado de Qwen2.5-Coder-0.5B-Instruct como base. Sobre él se aplicó un ajuste fino supervisado (SFT) mediante LoRA de rango 32, posteriormente fusionado en los pesos base, de modo que el checkpoint distribuido es un modelo denso estándar sin adaptadores separados. El corpus de entrenamiento es un conjunto público de código Rust bajo licencia Apache-2.0, filtrado hasta 74.606 ejemplos que producen código. No se documentan en la información disponible detalles sobre el número total de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

Una particularidad técnica relevante es la distribución de parámetros: una parte importante de los 0,5B reside en la matriz de embeddings, que no se cuantiza de forma agresiva. Por ello, la escalera GGUF del modelo ocupa solo unos 260 MB útiles en la práctica y el autor advierte que no cabe en los dispositivos más pequeños de su familia. El modelo incluye plantilla de chat (`chat_template.jinja`), lo que permite invocarlo en modo conversacional, y su rendimiento depende críticamente del formato del prompt: el autor documenta que la formulación "Complete the Rust code. Output only the missing code." produce fragmentos y baja al 2,56%, mientras que pedir explícitamente el cuerpo completo de la función alcanza el 28,21%.

## Capacidades

- Generación de texto y compleción de código, con especialización en Rust.
- Compleción de cuerpos de funciones Rust cuando se solicita de forma explícita y en lenguaje natural.
- Modo conversacional mediante plantilla de chat Jinja incluida en el repo.
- Generación de código en otros lenguajes heredada del base Qwen2.5-Coder, aunque sin especialización medida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está orientado a compleción puntual.
- Capacidades multilingües: limitadas al inglés como idioma declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- **Autocompletado de Rust en el editor**: integrado como servidor de compleción local (por ejemplo, vía llama.cpp u Ollama) para sugerir cuerpos de funciones mientras se escribe. Su tamaño de 0,5B permite latencias bajas en CPU y GPU de consumo, y su especialización en Rust mejora la tasa de acierto frente al base en este lenguaje concreto.
- **Generación de esqueletos y funciones auxiliares en proyectos Rust**: útil para producir implementaciones de funciones pequeñas y bien delimitadas (parseo, transformaciones, wrappers) donde el contexto necesario es corto y la tarea está claramente especificada en el prompt.
- **Asistente de código en dispositivos de borde y entornos sin conectividad**: al publicarse en Ollama (`ollama run thox-ai/thoxedge-rustcoder-0.5b`) y en GGUF Q8_0, puede desplegarse en portátiles y estaciones de trabajo sin GPU dedicada, manteniendo el código fuente en local.
- **Generación masiva de borradores de tests unitarios en Rust**: el modelo puede producir plantillas de tests y aserciones simples a partir de la firma de una función, que luego se revisan y ejecutan en CI.
- **Prototipado rápido de utilidades Rust en scripts internos**: para tareas de herramienta interna donde el coste de un modelo mayor no se justifica, el modelo ofrece una alternativa gratuita y local con licencia Apache-2.0.
- **Cascada de enrutamiento en producción**: como primer nivel de un sistema de enrutamiento de modelos (ThoxRoute), resolviendo peticiones triviales de Rust y derivando las complejas a modelos mayores, reduciendo coste por token.
- **Educación y ejemplos de Rust**: generación de fragmentos ilustrativos y ejercicios de práctica en entornos docentes, con revisión humana obligatoria.

## Benchmarks y rendimiento

| Benchmark | ThoxEdge-RustCoder-0.5B | Qwen2.5-Coder-0.5B-Instruct (base) |
|---|---|---|
| MultiPL-E HumanEval-Rust (156 problemas, ejecutados, modo chat) | 28,21% | 25,64% |
| MultiPL-E HumanEval-Rust con prompt "Output only the missing code" | 2,56% | No disponible |

El resto de benchmarks (MMLU, GSM8K, HumanEval en Python, etc.) no se han publicado en la información disponible.

## Requisitos de hardware

- **VRAM estimada en safetensors (fp16/bf16)**: aproximadamente 1 GB para los pesos, más overhead de activaciones y caché KV; viable en GPUs con 2-4 GB.
- **VRAM estimada en GGUF Q8_0**: aproximadamente 0,5-0,6 GB de pesos; ejecutable en CPU sin GPU dedicada.
- **GPU recomendadas**: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada para este modelo; también funciona en iGPU y CPU.
- **Cabe en GPU de consumo**: sí, en todas las GPU de consumo actuales con 4 GB o más; en CPU es plenamente funcional.
- **Opciones de despliegue**: transformers (safetensors), llama.cpp (GGUF Q8_0), Ollama (`thox-ai/thoxedge-rustcoder-0.5b`), text-generation-inference (tag `text-generation-inference` en el repo) y endpoints compatibles.
- **Latencia y throughput**: no disponibles de forma numérica en la información proporcionada; por el tamaño, se espera latencia de decodificación en el orden de decenas de tokens por segundo en CPU y cientos en GPU de consumo, aunque no se confirma con datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxEdge-RustCoder-0.5B | 0,5B | No disponible | Rust (fine-tune) | Apache-2.0 | HF, Ollama, GGUF |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | No disponible en la información | Código general | Apache-2.0 | HF, Ollama |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | No disponible en la información | Código general | Apache-2.0 | HF, Ollama |
| Modelos Rust específicos de 0,5B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más relevante es con su modelo base, ya que el fine-tune solo aporta una mejora medida de 2,57 puntos porcentuales en MultiPL-E HumanEval-Rust. Para tareas de Rust más exigentes, un modelo de 1,5B o superior del mismo linaje probablemente supere a este checkpoint, aunque no se dispone de datos ejecutados en la información proporcionada.

## Limitaciones y advertencias

- **Capacidad limitada por tamaño**: el propio autor advierte que es un modelo de 0,5B y que **no** es un buen programador de Rust; los resultados son una medición de delta, no una garantía de calidad.
- **Sensibilidad extrema al prompt**: la formulación "Output only the missing code" degrada el rendimiento al 2,56% frente al 28,21% con la formulación recomendada; en producción hay que controlar el formato del prompt.
- **Solo inglés**: el idioma declarado es únicamente inglés, lo que limita su uso en entornos hispanohablantes sin traducción previa.
- **Riesgo de alucinación**: como todo modelo generativo de código, puede producir APIs inexistentes, firmas incorrectas o código que compila pero no hace lo esperado; requiere compilación y tests en CI.
- **Idioma de especialización único**: la mejora medida se limita a Rust; en otros lenguajes se comporta esencialmente como el base.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el modelo se distribuye junto a material promocional de una campaña de Kickstarter; conviene revisar el texto completo de la licencia y el corpus de entrenamiento antes de un despliegue comercial.
- **Contexto no documentado**: no se especifica la longitud de contexto soportada, lo que impide planificar tareas de contexto largo.
- **No apto para decisiones de alto riesgo**: el autor excluye explícitamente usos médicos, legales, financieros y de seguridad crítica sin revisión humana, así como el control no supervisado de dispositivos físicos.
- **No cabe en los dispositivos más pequeños de THOX**: por la proporción de parámetros en embeddings, la escalera GGUF ocupa solo unos 260 MB útiles y el autor indica que no encaja en los dispositivos más pequeños de su familia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxEdge-RustCoder-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Página de THOX.ai: https://thox.ai/
- Demo de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campaña de Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
- Ollama: `ollama run thox-ai/thoxedge-rustcoder-0.5b`
- Paper o blog técnico del fine-tune: no disponible en la información proporcionada.
