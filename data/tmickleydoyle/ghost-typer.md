# tmickleydoyle/ghost-typer

## Resumen

ghost-typer es un modelo de autocompletado de texto orientado a prompts de asistentes de programación, desarrollado por tmickleydoyle y publicado en Hugging Face bajo licencia MIT. Su particularidad es que no ha sido entrenado mediante descenso de gradiente: es un modelo "compilado", es decir, sus pesos se generan mediante reglas en forma cerrada (n-gramas) aplicadas sobre aproximadamente 126.000 líneas de texto escrito por humanos. No hay pesos preentrenados ni ajuste fino; cada parámetro deriva de un cálculo determinista en `build_weights.py`.

El modelo se distribuye como un `LlamaForCausalLM` estándar de 396 millones de parámetros (97% de ellos ceros), cargable con `transformers` sin `trust_remote_code`. Su función es mostrar "ghost text" (texto fantasma) predictivo mientras el usuario escribe, y solo sugiere cuando supera un umbral de confianza calibrado sobre prompts reservados. Existe una variante hermana para navegador (`ghost-typer-web`) de 10,8 MB en uint8 que corre íntegramente en el cliente con un runtime TypeScript sin dependencias.

Su relevancia actual radica en que demuestra que un autocompletado útil y con precisión medida (90,2% por defecto) puede lograrse sin entrenamiento neuronal, con un coste computacional mínimo (2,6 ms de mediana por pulsación en navegador) y desplegable on-device, lo que lo hace atractivo para entornos con requisitos estrictos de privacidad o latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (`LlamaForCausalLM`) compilado a partir de n-gramas; 97% de pesos a cero |
| Parametros totales | 395.766.000 (396M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 (canónico, `model.safetensors`); uint8 (variante navegador, `model.bin`); float32 sin cuantizar en variante navegador (`model-f32.bin`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); bin (variante navegador) |

## Arquitectura y entrenamiento

El modelo no se entrena: se compila. Los pesos de `model.safetensors` se generan aplicando reglas en forma cerrada sobre n-gramas extraídos de aproximadamente 126.000 líneas de texto humano, con fuentes documentadas en `data/SOURCES.md`. El resultado se materializa como un transformer tipo Llama cuyos logits equivalen a las log-probabilidades del n-grama compilado, coincidiendo con la referencia dentro de 2e-5 nats. El vocabulario del modelo de transformers es de 6.000 palabras y maneja 12.424 contextos; la variante de navegador usa un vocabulario mayor (31.486 palabras) y 520.483 contextos, ya que su formato disperso abarata el coste por palabra.

Una innovación técnica destacable es la calibración por umbral: el modelo solo emite sugerencia si la confianza supera un umbral (0,71 por defecto) cuya precisión se mide sobre prompts reservados (10% de los prompts excluidos de la compilación). El umbral es un parámetro en tiempo de ejecución, lo que permite intercambiar cobertura por precisión sin recompilar. Además, los logits están escalados por 1e-5 para mantener la red exacta, lo que impide usar float16/bf16 (no hay versión en media precisión). La cuantización uint8 frente a float32 en la variante de navegador cambió la precisión sobre reservados en +0,01 puntos, un coste despreciable.

## Capacidades

- Autocompletado de texto predictivo ("ghost text") para prompts de asistentes de programación, mostrando sugerencias solo por encima de un umbral de confianza.
- Predicción de continuación a nivel de carácter y palabra en inglés, orientada a frases típicas de interacción con asistentes de código.
- Sugerencias de alta precisión: 90,2% por defecto, hasta 96,4% en modo `strict` (umbral 0,90) y 97,7% con umbral 0,95.
- Ahorro medido de pulsaciones: 22,3% aceptando todas las sugerencias correctas con Tab en el umbral por defecto.
- Ejecución on-device en navegador mediante runtime TypeScript sin dependencias (10,8 MB, uint8), sin servidor.
- Integración con `transformers` mediante `pipeline("text-generation")` como modelo de causal LM estándar.
- Compatibilidad con text-generation-inference y endpoints compatibles (según tags del repo).
- Capacidad multilingüe: no disponible (solo inglés).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Autocompletado en editores de código y IDE: el modelo se integra en el campo de entrada de prompts y muestra ghost text tras cada pulsación; con 2,6 ms de mediana por pulsación en navegador, la latencia es imperceptible y no requiere llamada a servidor.
- Asistentes de programación en el navegador: la variante `ghost-typer-web` (10,8 MB, uint8) corre íntegramente en la pestaña del usuario, lo que permite ofrecer autocompletado sin enviar el texto del usuario a ningún backend, útil por privacidad y cumplimiento.
- Herramientas de productividad on-device: cualquier aplicación web que necesite sugerencias de escritura en inglés (formularios, chats de soporte, documentación) puede usar el runtime TypeScript en Web Worker o Bun/Node sin dependencias.
- Reducción de fricción en la escritura de prompts: dado que ahorra un 22,3% de pulsaciones en prompts reales de chat (21,9% en WildChat), mejora la experiencia en interfaces de chat con modelos de código donde el usuario redacta consultas largas.
- Despliegue en entornos con recursos limitados: el modelo de transformers (1,58 GB en float32, 396M parámetros con 97% de ceros) puede servirse con `transformers`, TGI o endpoints compatibles en CPU, sin necesidad de GPU.
- Investigación sobre autocompletado y calibración de umbrales: al ser un modelo compilado y reproducible, sirve como referencia para estudiar el equilibrio precisión/cobertura y para comparar con enfoques entrenados.
- Prototipado rápido de funciones de autocompletado: la API `CompiledAutocomplete.load()` y `ac.suggest(text, { tau })` permite ajustar el umbral en producción sin recompilar ni reentrenar.

## Benchmarks y rendimiento

Resultados medidos con `python scripts/benchmark.py` sobre el archivo cuantizado distribuido, con conjuntos reservados de 1.000 prompts de WildChat más 711 de OASST, MBPP y CoNaLa.

| Umbral | Precision | Coverage | Keystrokes saved | Solo chat real (WildChat) |
|---|---|---|---|---|
| 0,71 (por defecto) | 90,2% | 37,6% | 22,3% | 89,9% precisión, 21,9% ahorrado |
| 0,80 | 93,4% | 32,7% | 19,6% | 92,9%, 19,3% |
| 0,90 (`strict`) | 96,4% | 26,3% | 15,8% | 96,3%, 15,6% |
| 0,95 | 97,7% | 20,7% | 12,4% | 97,4%, 12,2% |

Rendimiento de inferencia:

| Métrica | Navegador (`model.bin`, uint8) | Transformers (`model.safetensors`, float32) |
|---|---|---|
| Latencia | 2,6 ms mediana, 4,8 ms p95 por pulsación | 58 ms por siguiente token (PyTorch CPU) |
| Tamaño | 10,8 MB | 1,58 GB |
| Vocabulario / contextos | 31.486 palabras / 520.483 contextos | 6.000 palabras / 12.424 contextos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo de transformers corre en CPU (58 ms por token en PyTorch CPU) y la variante de navegador corre en el hilo principal o en Web Worker.
- GPU recomendadas: no disponibles ni necesarias; cualquier GPU compatible con PyTorch puede acelerar la inferencia, pero no se han publicado cifras.
- ¿Cabe en GPU consumer? Sí, con holgura: 1,58 GB en float32 cabe en cualquier GPU consumer, aunque el diseño está pensado para CPU y navegador.
- Opciones de despliegue: `transformers` (pipeline de text-generation), text-generation-inference (TGI), endpoints compatibles, runtime TypeScript propio (`web/autocomplete.ts`, `tokenizer.ts`) en navegador, Bun o Node.
- Latencia y throughput: 2,6 ms mediana y 4,8 ms p95 por pulsación en navegador; 58 ms por siguiente token en PyTorch CPU con el modelo de transformers. Throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ghost-typer (este) | 396M (97% ceros) | no disponible | Compilado por n-gramas, sin entrenamiento | MIT | HF + variante navegador |
| Modelos de autocompletado neuronal tipo CodeGPT/StarCoder-base | cientos de M a varios B | variable | Entrenados con descenso de gradiente | variable | HF |
| Copilot / asistentes comerciales | no disponible | no disponible | Modelos grandes entrenados, servicio en la nube | propietaria | SaaS |

No se dispone de datos comparativos de rendimiento frente a alternativas concretas en la información proporcionada. La comparativa se limita a características estructurales; los benchmarks de ghost-typer no son directamente comparables con MMLU/HumanEval de modelos neuronales.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que limita su uso en aplicaciones multilingües.
- Modelo compilado, no entrenado: no generaliza más allá de los patrones n-grama observados en las ~126.000 líneas de texto fuente; su cobertura es limitada (37,6% de pulsaciones en el umbral por defecto).
- Riesgo de sugerencias incorrectas: aunque la precisión es alta (90,2% por defecto), un 9,8% de sugerencias mostradas son incorrectas; en modo `strict` baja al 3,6%.
- No apto para generación libre: está diseñado exclusivamente para autocompletado de prompts; no es un modelo de razonamiento, código, matemáticas ni agentes.
- Sin tool calling ni capacidades de agente.
- No hay versión en float16/bf16: los logits están escalados por 1e-5 para mantener la exactitud, lo que rompe la media precisión; esto restringe opciones de despliegue acelerado.
- En transformers 4.x hay que pasar `add_special_tokens=True` en el pipeline, ya que 4.x no antepone BOS por defecto.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre idoneidad en producción.
- Sesgos: no documentados en la información disponible; al derivarse de texto humano, puede heredar sesgos de las fuentes (WildChat, OASST, MBPP, CoNaLa).
- El umbral de confianza debe calibrarse para cada aplicación; el valor por defecto (0,71) está medido sobre los conjuntos reservados del autor, no sobre dominios específicos del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmickleydoyle/ghost-typer
- Variante navegador: https://huggingface.co/tmickleydoyle/ghost-typer-web
- Demo en vivo: https://tmickleydoyle.github.io/ghost-typer/
- Código fuente: https://github.com/tmickleydoyle/ghost-typer
- Script de compilación: `build_weights.py` (en el repositorio)
- Fuentes de datos: `data/SOURCES.md` (en el repositorio)
- Script de benchmark: `scripts/benchmark.py` (en el repositorio)
- Datasets referenciados: allenai/WildChat-1M, OpenAssistant/oasst2, google-research-datasets/mbpp, neulab/conala
