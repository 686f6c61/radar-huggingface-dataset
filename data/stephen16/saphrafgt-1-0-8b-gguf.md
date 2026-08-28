# Stephen16/SaphraFgt-1.0-8B-GGUF

## Resumen

SaphraFgt 1.0 8B es un modelo de lenguaje especializado en desarrollo frontend, creado por Stephen16 (Seelam Reuben Stephen) como un fine-tuning de Meta Llama 3.1 8B. Está optimizado para generación de HTML, CSS, JavaScript, implementación de UI/UX, corrección de errores, completado de código y refactorización, con un enfoque claro en la creación de sitios web completos y componentes de interfaz. El modelo se distribuye en formato GGUF cuantizado (Q4_K_M) para su uso eficiente con llama.cpp y Ollama, lo que permite ejecutarlo en hardware de consumo.

La relevancia de este modelo radica en su especialización: mientras que los modelos generalistas de 7B-8B suelen tener un rendimiento mediocre en tareas de frontend, SaphraFgt 1.0 8B ha sido ajustado específicamente para este dominio, ofreciendo resultados competitivos en benchmarks de código como HumanEval (36.6%) y MBPP (41.5%). Su licencia Llama 3.1 Community permite uso comercial con ciertas restricciones, y su tamaño compacto lo hace accesible para desarrolladores que necesitan un asistente de código local sin depender de servicios en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.030.261.312 (8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredado de Llama 3.1, probablemente 128k, no confirmado) |
| Tipos de cuantizacion | Q4_K_M (única incluida en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer estándar de Llama 3.1 8B, con atención de múltiples cabezas y normalización RMSNorm. No es un modelo MoE ni híbrido; es un modelo denso de 8.030 millones de parámetros. El fine-tuning se realizó sobre la versión cuantizada en 4 bits de unsloth/Meta-Llama-3.1-8B-bnb-4bit, lo que sugiere el uso de técnicas de entrenamiento eficiente como LoRA o QLoRA, aunque no se especifican los detalles del dataset ni el método de alineación (no se menciona RLHF ni DPO). La especialización en frontend indica que el dataset de entrenamiento probablemente contiene ejemplos de HTML, CSS, JavaScript, diseño responsive y corrección de errores, pero no se proporcionan cifras de tokens ni composición exacta.

## Capacidades

- Generación de código frontend completo: crea páginas HTML con estilos CSS integrados y funcionalidad JavaScript.
- Diseño responsive: implementa layouts adaptables a distintos tamaños de pantalla.
- Implementación de UI/UX: traduce especificaciones de diseño en componentes de interfaz funcionales.
- Corrección de errores (bug fixing): identifica y corrige problemas en código HTML, CSS y JavaScript.
- Completado de código: sugiere continuaciones de código en contexto de desarrollo frontend.
- Refactorización: mejora la estructura y legibilidad del código existente.
- Optimización de frontend: sugiere mejoras de rendimiento y buenas prácticas.
- Generación de landing pages, dashboards, portfolios y e-commerce.
- Soporte de tool calling: no se menciona explícitamente, pero al ser un modelo de código, podría ser compatible con funciones de llamada a herramientas si se usa con frameworks como Ollama, aunque no está confirmado.
- Capacidades multilingües: limitadas al inglés, según la model card.

## Casos de uso

- Generación de prototipos rápidos: un desarrollador puede pedir "crea una landing page responsive para una startup" y obtener un HTML completo con CSS y JavaScript listo para iterar.
- Asistente de maquetación: integrado en un editor como VS Code, puede generar componentes UI (botones, tarjetas, formularios) a partir de descripciones en lenguaje natural.
- Corrección de errores en producción: al pegar un fragmento de código con un bug, el modelo sugiere la corrección y explica el problema.
- Generación de dashboards de administración: crea paneles con gráficos, tablas y navegación usando librerías como Chart.js o D3.js.
- Refactorización de código legacy: ayuda a modernizar código antiguo de jQuery a JavaScript moderno o a separar CSS en módulos.
- Educación y aprendizaje: sirve como tutor para estudiantes de desarrollo web, generando ejemplos comentados y explicando conceptos de frontend.
- Automatización de tareas repetitivas: genera plantillas de correos electrónicos HTML, formularios de contacto o secciones de página web de forma consistente.

## Benchmarks y rendimiento

Según la model card del autor, se reportan los siguientes resultados:

| Benchmark | Score |
|---|---|
| HumanEval (Pass@1) | 36.6% |
| MBPP (Pass@1) | 41.5% |

No se han publicado resultados adicionales en la información disponible. Estos datos provienen de la model card y no se ha verificado su reproducibilidad de forma independiente.

## Requisitos de hardware

- El archivo GGUF Q4_K_M tiene un tamaño aproximado de 4.9 GB (tamaño del repo), por lo que se estima que requiere al menos 6 GB de VRAM para inferencia con llama.cpp u Ollama.
- Puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. También es posible ejecutarlo en CPU con suficiente RAM (8-16 GB) usando llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (comando `ollama run SaphraFgt/saphrafgt-1-0-8b`), y cualquier framework compatible con GGUF como GPT4All o LM Studio.
- No se proporcionan datos de latencia o throughput específicos. Para un modelo 8B cuantizado Q4_K_M, se espera una velocidad de generación de 20-40 tokens/s en una GPU moderna (RTX 4090) y 5-10 tokens/s en CPU.

## Comparativa con modelos similares

La model card incluye una comparación con otros modelos de código de 7B:

| Modelo | HumanEval | MBPP |
|---|---|---|
| SaphraFgt 1.0 8B | 36.6% | 41.5% |
| Code Llama 7B | 33.5% | 41.4% |
| Gemma 7B | 32.3% | 38.0% |
| Mistral 7B | 26.2% | 50.2% |
| LLaMA 2 7B | 16.8% | 20.8% |

Cabe destacar que Mistral 7B supera a SaphraFgt en MBPP, pero SaphraFgt obtiene mejor resultado en HumanEval. La comparación se limita a estos modelos y no incluye alternativas más recientes como CodeLlama 7B Instruct o DeepSeek Coder 6.7B.

## Limitaciones y advertencias

- El modelo está especializado en frontend y puede tener un rendimiento deficiente en otras tareas de programación (backend, algoritmos, etc.).
- Solo soporta inglés; no se ha entrenado para otros idiomas, lo que limita su uso en entornos multilingües.
- Los benchmarks reportados provienen del autor y no han sido verificados de forma independiente; los resultados pueden variar en la práctica.
- Al ser un fine-tuning de Llama 3.1, hereda posibles sesgos y limitaciones del modelo base, incluyendo riesgo de alucinación en código (generar APIs o funciones inexistentes).
- La licencia Llama 3.1 Community permite uso comercial, pero si tu empresa tiene más de 700 millones de usuarios mensuales, necesitas una licencia comercial de Meta.
- No se especifica el dataset de entrenamiento ni el método de alineación, lo que dificulta evaluar la robustez del modelo ante entradas adversas.
- La cuantización Q4_K_M puede degradar ligeramente la calidad de generación en comparación con el modelo en precisión completa.

## Enlaces

- [HuggingFace - Stephen16/SaphraFgt-1.0-8B-GGUF](https://huggingface.co/Stephen16/SaphraFgt-1.0-8B-GGUF)
- [GitHub - Stephen162008/SaphraFgt](https://github.com/Stephen162008/SaphraFgt)
- [Modelo base - unsloth/Meta-Llama-3.1-8B-bnb-4bit](https://huggingface.co/unsloth/Meta-Llama-3.1-8B-bnb-4bit)
