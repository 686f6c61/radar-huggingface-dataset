# sudhanshu42844/my-tiny-llm

## Resumen

`my-tiny-llm` es un modelo de lenguaje causal decoder-only de estilo GPT-2, entrenado desde cero (inicialización aleatoria) por el usuario sudhanshu42844 sobre un subconjunto muy reducido del dataset TinyStories. Con 1.060.992 parámetros, vocabulario BPE de 3.512 tokens y licencia sin especificar, se publica explícitamente como prueba de concepto experimental y no como un modelo listo para producción ni para seguir instrucciones.

El modelo no incorpora innovaciones arquitectónicas: reproduce el esquema transformer causal estándar con tokenizador BPE propio, entrenado con PyTorch y Hugging Face Transformers en una GPU de consumo (NVIDIA GeForce GTX 1650, 4 GB de VRAM). El entrenamiento reportado usó solo 270 ejemplos de entrenamiento y 30 de validación durante 2 épocas, con pérdidas finales de 6,6421 (train) y 6,3688 (validación), valores que reflejan un ajuste muy limitado y en ningún caso calidad de lenguaje general.

Su relevancia es pedagógica: sirve como ejemplo mínimo reproducible del ciclo completo de entrenamiento, tokenización, guardado y carga de un checkpoint con Transformers. No hay benchmarks publicados, no hay evaluación de sesgos ni de robustez, y el propio autor desaconseja su uso para responder preguntas factuales o para decisiones críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, estilo GPT-2 |
| Parametros totales | 1.060.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible (la model card omite deliberadamente el campo `license`) |
| Formato de pesos | safetensors (repo con `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal con tokenizador BPE entrenado sobre el texto de entrenamiento muestreado y un vocabulario de 3.512 tokens. Se inicializó desde pesos aleatorios y se entrenó con PyTorch y Hugging Face Transformers sobre la partición `train` del dataset `roneneldan/TinyStories` (texto en inglés). No se documentan detalles como número de capas, dimensión oculta, número de cabezas de atención, función de activación ni normalización; esos hiperparámetros no están disponibles en la información proporcionada.

El régimen de entrenamiento es extremadamente reducido: 270 ejemplos de entrenamiento, 30 de validación y 2 épocas, ejecutado en una GTX 1650 de 4 GB. Las pérdidas registradas fueron 7,5319 y 6,6421 en entrenamiento (épocas 1 y 2) y 7,0656 y 6,3688 en validación. No se reporta uso de RLHF, DPO, SFT ni ninguna técnica de alineación, ni innovaciones como decodificación especulativa o atención lineal. El autor indica que el programa de entrenamiento debe consultarse para reproducir la ejecución, especificando dataset, arquitectura, semilla, optimizador y argumentos de entrenamiento.

## Capacidades

- Generación de texto causal autoregresiva en inglés, orientada a continuaciones de estilo cuento infantil.
- Modelado de lenguaje causal (`causal-language-modeling`) con tokenizador BPE propio.
- Carga e inferencia mediante `AutoTokenizer` y `AutoModelForCausalLM` de Transformers.
- Compatibilidad declarada con text-generation-inference y endpoints (etiquetas del repo).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo thinking, visión, audio ni multimodalidad.
- Capacidad multilingüe: únicamente inglés; no hay evidencia de transferencia a otros idiomas.

## Casos de uso

- Docencia y demostración de entrenamiento desde cero: el checkpoint permite recorrer el pipeline completo (tokenización BPE, entrenamiento, guardado y carga con Transformers) en una GPU de 4 GB, lo que lo hace apto para prácticas de laboratorio.
- Pruebas de integración de Hugging Face Hub: sirve para validar flujos de descarga, carga de safetensors y ejecución de `model.generate` en entornos de CI sin coste de cómputo relevante.
- Test de pipelines de serving ligeros: por su tamaño (1,06 M de parámetros y repo de 0,0 GB), puede usarse como smoke test en despliegues con text-generation-inference o endpoints antes de mover modelos reales.
- Experimentos de tokenización: al incluir un tokenizador BPE propio con vocabulario de 3.512 tokens, permite estudiar el efecto del vocabulario en la generación sobre texto sencillo en inglés.
- Generación de continuaciones de cuentos muy cortos con fines ilustrativos: partiendo de prompts como "Once upon a time", produce texto de estilo infantil, útil para mostrar el comportamiento de un modelo infrentrenado y sus fallos típicos.
- Reproducción de experimentos de scaling a pequeña escala: permite comparar curvas de pérdida con configuraciones alternativas sobre el mismo subconjunto de TinyStories, siempre con fines de investigación metodológica y no de calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de entrenamiento y validación sobre el subconjunto usado:

| Metrica | Epoca 1 | Epoca 2 |
|---|---|---|
| Training loss | 7,5319 | 6,6421 |
| Validation loss | 7,0656 | 6,3688 |

El autor advierte que estas pérdidas son específicas de este subconjunto pequeño y no establecen calidad de lenguaje de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 1,06 M de parámetros; cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquiera con al menos 4 GB de VRAM; el propio entrenamiento se realizó en una NVIDIA GeForce GTX 1650 de 4 GB.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3060, RTX 4090 y similares; también es viable en CPU.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), text-generation-inference y endpoints compatibles según las etiquetas del repo; no se documenta soporte de llama.cpp, Ollama, vLLM ni TGI más allá de la etiqueta `text-generation-inference`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| my-tiny-llm (sudhanshu42844) | 1.060.992 | no disponible | 270 ejemplos, 2 épocas, TinyStories | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | WebText a gran escala | MIT (pesos publicados) | Hugging Face |
| TinyStories-1M (roneneldan) | ~1 M | no disponible | TinyStories completo | MIT (según repo del autor original) | Hugging Face |

La comparación con GPT-2 small y con los modelos TinyStories de referencia es solo orientativa: `my-tiny-llm` usa un subconjunto ínfimo del dataset y no publica evaluaciones, por lo que no es equiparable en calidad de generación. Los datos de los modelos comparados no provienen de la información proporcionada y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Entrenado con solo 270 ejemplos y 2 épocas: la generación puede ser repetitiva, agramatical, incoherente o directamente engañosa.
- No es un modelo de instrucciones: no sigue instrucciones ni responde preguntas factuales de forma fiable.
- No se han realizado evaluaciones de seguridad, sesgo, robustez ni generalización; se desconoce el comportamiento fuera del dominio de TinyStories.
- Idioma limitado al inglés; no hay soporte ni evaluación en castellano.
- Licencia no especificada: el autor omite deliberadamente el campo `license` y advierte que debe elegirse una licencia para los pesos tras revisar qué permite distribuir. El uso comercial queda, por tanto, sin marco legal claro y no debe asumirse permitido.
- La licencia del dataset (CDLA-Sharing-1.0) es la del dataset TinyStories, no la de los pesos del modelo.
- Longitud de contexto no documentada: no se puede planificar su uso en conversaciones multi-turno largas.
- No apto para producción, decisiones críticas ni atención al cliente real.
- Riesgo alto de alucinación por el régimen de entrenamiento extremadamente limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudhanshu42844/my-tiny-llm
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
