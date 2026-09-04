# staticlabs/dlm-code0.6b-exp

## Resumen

El modelo dlm-code0.6b-exp es un modelo experimental de difusión enmascarada discreta (MDM) para generación de código, desarrollado por staticlabs como parte del proyecto thunder-fast. Se trata de una adaptación de un modelo de código preentrenado basado en Qwen2 de aproximadamente 0.5B parámetros (630.167.424 en total), que en lugar de generar token a token de forma autoregresiva, rellena una ventana de salida completa mediante un proceso iterativo de desenmascarado con atención bidireccional a lo largo de 24 pasos de difusión.

El modelo está diseñado para funcionar con un decodificador de difusión específico, como el runtime thunder-fast, y no puede usarse como un modelo causal Qwen2ForCausalLM convencional. Su contexto es de 256 tokens por ventana, con soporte para infilling (relleno de huecos en el código). Al ser una versión experimental (.exp), su interés principal es explorar alternativas a la generación autoregresiva en el dominio del código, con posible paralelización de la generación, aunque no se han publicado benchmarks que confirmen su rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Discrete masked-diffusion (MDM) sobre backbone Qwen2 (transformer con GQA) |
| Parámetros totales | 630.167.424 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (ventana) |
| Tipos de cuantización | no disponible (pesos en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone Qwen2 con atención bidireccional y un proceso de difusión discreta enmascarada. El backbone tiene 24 capas, dimensión oculta de 896, 14 cabezas de atención y 2 cabezas KV, utilizando Grouped Query Attention (GQA). El vocabulario consta de 151.936 tokens más un token de máscara especial (`<M>`, id 151665). La generación no es autoregresiva: se parte de una ventana completamente enmascarada y se desenmascara progresivamente en 24 pasos, seleccionando posiciones según una confianza basada en entropía (`alg_temp` 0.6, `top_k` 500).

No se han publicado datos sobre el conjunto de datos de entrenamiento, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. La principal innovación técnica es el uso de difusión discreta enmascarada para generación de código, que permite rellenar la ventana de salida en paralelo y soportar infilling, a diferencia de los modelos causales de siguiente token.

## Capacidades

- Generación de código mediante difusión enmascarada, con desenmascarado progresivo y atención bidireccional.
- Soporte de infilling: puede rellenar fragmentos de código en posiciones intermedias de una ventana.
- Generación paralela: la ventana de salida se rellena en paralelo a lo largo de 24 pasos de difusión.
- No es un modelo autoregresivo de siguiente token; no se ha informado de soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés (`language: en`).
- No se mencionan capacidades de visión, audio ni otras modalidades.
- Requiere un runtime de difusión específico (thunder-fast) para funcionar; cargarlo como `Qwen2ForCausalLM` no reproduce la generación por difusión.

## Casos de uso

- Autocompletado de código en editores: gracias al soporte de infilling y a la atención bidireccional, el modelo puede rellenar el hueco central de un fragmento de código, lo que resulta útil para sugerencias en tiempo real en IDEs.
- Refactorización asistida: dado un bloque de código con una función o sección incompleta, el modelo puede completar la implementación que falta dentro de la ventana de 256 tokens.
- Generación de código en entornos con restricciones de hardware: al ser un modelo de ~0.6B parámetros, puede ejecutarse en equipos modestos con el runtime thunder-fast, lo que lo hace adecuado para prototipos locales.
- Investigación en modelos de difusión para código: sirve como banco de pruebas para estudiar la generación no autoregresiva, el desenmascarado progresivo y el paralelismo de salida.
- Completado de plantillas de código en pipelines de CI: puede utilizarse para rellenar bloques de código generados a partir de plantillas, siempre que se integre con el decodificador de difusión adecuado.
- Generación de código en modo experimental: para desarrolladores que quieran experimentar con difusión enmascarada en el dominio del código, este modelo ofrece una implementación de referencia del proyecto thunder-fast.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Los pesos en bf16 ocupan aproximadamente 1.26 GB (630.167.424 parámetros × 2 bytes), por lo que una estimación razonable para inferencia sería de 2 a 3 GB de VRAM, teniendo en cuenta el overhead del runtime.
- GPU recomendadas: no disponible. Dado el tamaño del modelo, podría ejecutarse en GPUs de consumo, pero no hay datos oficiales de hardware soportado.
- Compatibilidad con GPU de consumo: probablemente sí, aunque no confirmado; se requeriría una GPU con al menos 4 GB de VRAM para una ejecución holgada.
- Opciones de despliegue: el modelo card indica que debe usarse con el runtime thunder-fast (motor ggml) o con el DiffusionLM de referencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El modelo es una adaptación experimental de un backbone Qwen2 de ~0.5B a difusión enmascarada, pero no se han publicado comparativas con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Estado experimental: el checkpoint está marcado como work-in-progress (`.exp`) y no se recomienda para producción.
- Dependencia de runtime específico: requiere un decodificador de difusión (thunder-fast o DiffusionLM); cargarlo como `Qwen2ForCausalLM` no reproduce la generación.
- Contexto limitado: ventana de 256 tokens, lo que restringe la generación de código largo o dependencias de contexto amplio.
- Idioma: solo inglés, sin soporte multilingüe.
- Licencia no disponible: esto puede impedir el uso comercial o la redistribución.
- Benchmarks ausentes: no se han publicado resultados de rendimiento, por lo que su calidad y velocidad relativas son desconocidas.
- Riesgo de alucinación: como en cualquier modelo de lenguaje, puede generar código incorrecto o sintácticamente inválido.
- Sesgos: no hay información sobre sesgos del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/staticlabs/dlm-code0.6b-exp
- Repositorio thunder-fast: https://github.com/AdrianTuci1/thunder-fast
