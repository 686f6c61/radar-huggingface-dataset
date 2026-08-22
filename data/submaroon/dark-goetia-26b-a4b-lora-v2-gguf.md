# SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2-GGUF

## Resumen

Dark-Goetia-26B-A4B-LoRA-v2 es un adaptador LoRA en formato GGUF desarrollado por SubMaroon, diseñado para ajustar el estilo narrativo de modelos de roleplay hacia un tono más oscuro y literario, específicamente para escenarios de Dark Fantasy. No es un modelo independiente: se aplica sobre el modelo base Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA, un Gemma 4 MoE abliterated de 26B parámetros totales y 4B activos. El adaptador entrena únicamente 22.978.560 parámetros (0,089% del total), lo que lo hace extremadamente ligero (0,2 GB) y fácil de distribuir.

El adaptador se centra exclusivamente en ajustar la prosa y la estructura de las respuestas en roleplay, sin incorporar tramas ni personajes de los datos de entrenamiento. Está optimizado para inglés, aunque también funciona en ruso con un efecto más débil. Su relevancia radica en que permite personalizar el estilo de un modelo grande sin necesidad de reentrenarlo, mediante un simple archivo GGUF que se carga junto al modelo base en herramientas como SillyTavern o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Gemma 4 MoE (modelo base: Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA) |
| Parametros totales | 22.978.560 (adaptador) |
| Parametros activos | No aplica (adaptador, no modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | GGUF (no se especifica el tipo exacto; probablemente f16 o similar) |
| Idiomas soportados | en, ru |
| Licencia | gemma |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El adaptador se entrenó con QLoRA en 4 bits, restringido a las proyecciones de atención (`q/k/v/o_proj`) de las 30 capas del text tower del modelo base. Se utilizaron 115 proyecciones de atención (no 120, porque las capas 5, 11, 17, 23 y 29 son de atención global y carecen de `v_proj`). Los hiperparámetros fueron r=32, alpha=64, 2 épocas, con pérdida solo en completions. El dataset se construyó a partir de una novela dividida en escenas, que luego fueron reescritas por una red neuronal para convertirlas en un dataset sintético de roleplay, preservando acciones y pensamientos internos pero eliminando el estilo de prosa del autor original. Contiene muestras en inglés y ruso, con predominio del inglés.

Un análisis de las normas de Frobenius del delta efectivo `ΔW = (B·A)·(alpha/r)` muestra que la distribución no es uniforme: `o_proj` tiene la mayor norma (1,563), seguida de `q_proj` (1,314), `v_proj` (1,049) y `k_proj` (0,828). En total, el componente OV (output-value) representa aproximadamente el 61% de la norma cuadrada y el QK el 39%. Este desequilibrio es relevante porque el componente OV es el que más contribuye al estilo, mientras que ambos componentes afectan a la degradación del formato estructurado, siendo OV unas 3 veces más sensible por unidad de cambio de peso.

## Capacidades

- Ajuste de estilo narrativo: añade un tono más oscuro, literario y atmosférico a las respuestas de roleplay, especialmente en escenarios de Dark Fantasy.
- Roleplay conversacional: funciona en sesiones completas de roleplay con tarjetas de personaje y system prompt; el efecto es más débil en prompts cortos aislados.
- Soporte multilingüe: optimizado para inglés, con funcionalidad reducida en ruso (el efecto de estilo es más débil y la adherencia a instrucciones es más frágil).
- Compatibilidad con salida estructurada: puede mantener bloques de formato (trackers de estado, secciones de World State, bloques de pensamiento interno) hasta ciertos umbrales de escala, que varían según el idioma.
- Escalado controlado: permite ajustar la intensidad del estilo mediante el parámetro de escala, con rangos recomendados medidos empíricamente.
- No contiene tramas ni personajes: el adaptador solo modifica el estilo, no introduce contenido narrativo específico.

## Casos de uso

- Roleplay de Dark Fantasy en SillyTavern: el adaptador se carga como LoRA en SillyTavern junto con el modelo base, permitiendo que el asistente adopte un tono más sombrío y literario en partidas de rol con tarjetas de personaje complejas (más de 2000 tokens). Es adecuado porque la escala recomendada (0,3–0,55) mantiene la estabilidad en prosa libre.
- Escritura creativa asistida: para autores que necesitan generar narrativa oscura con un estilo consistente, el adaptador puede aplicarse a un modelo base para producir borradores de escenas con atmósfera gótica o terrorífica, sin necesidad de reentrenar el modelo.
- Generación de contenido para juegos de rol de mesa: los game masters pueden usar el adaptador para describir escenarios, mazmorras o encuentros con un tono más inmersivo y literario, manteniendo la coherencia del mundo.
- Traducción estilística de narrativa: aunque el adaptador no traduce, puede aplicarse a un modelo base que ya soporte ruso para ajustar el estilo de respuestas en ese idioma, con la precaución de reducir la escala (hasta 0,37) para evitar fallos de formato.
- Personalización de asistentes conversacionales con temática oscura: se puede integrar en chatbots de ficción o entretenimiento que requieran un tono más serio y literario, siempre que el caso de uso no exija salida estructurada estricta.
- Experimentación con adaptadores LoRA: el análisis detallado de la distribución de pesos (OV vs QK) lo convierte en un caso de estudio útil para investigadores que quieran entender cómo afectan las distintas proyecciones de atención al estilo y al formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador no incluye métricas de rendimiento como MMLU, HumanEval o GSM8K, ya que su propósito es exclusivamente el ajuste de estilo y no la mejora de capacidades generales del modelo base.

## Requisitos de hardware

- El adaptador en sí es muy ligero (0,2 GB) y no requiere VRAM adicional significativa, pero debe cargarse junto con el modelo base, que es un MoE de 26B parámetros totales y 4B activos.
- Según LLM Explorer, el modelo base Dark Goetia 26B A4B V2 requiere aproximadamente 51,6 GB de VRAM en alguna cuantización, lo que implica que se necesitan GPUs de alta gama como A100 (80 GB), H100 (80 GB) o múltiples RTX 4090 (24 GB cada una) en configuración multi-GPU.
- En consumer GPUs, el modelo base podría caber en una RTX 4090 con cuantización agresiva (por ejemplo, Q4_K_M), pero no hay datos específicos para este adaptador.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y SillyTavern (a través de la integración con llama.cpp). También se puede servir con vLLM o TGI si se convierte a safetensors, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles. Dependen del modelo base y del hardware utilizado.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en el mismo nicho (roleplay oscuro sobre Gemma 4 MoE). El propio autor publica dos variantes experimentales (v3-A y v3-B) que dividen el conjunto de objetivos del adaptador v2, pero no hay datos de rendimiento comparativo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Contenido 18+: el modelo base está abliterated y los datos de entrenamiento incluyen contenido adulto y oscuro. No apto para menores ni para contextos profesionales sensibles.
- Optimizado para inglés: en ruso, el efecto de estilo es más débil y la adherencia a instrucciones es más frágil, especialmente con salida estructurada.
- Umbrales de escala medidos con una sola generación por configuración y a una profundidad de contexto única: deben tratarse como puntos de partida calibrados, no como constantes rígidas.
- Riesgo de degradación del formato: con escalas altas (por encima de 0,55 en prosa libre, o 0,40 en inglés y 0,37 en ruso para salida estructurada), el modelo puede empezar a omitir bloques de formato requeridos por la tarjeta de personaje.
- Dependencia del modelo base: el adaptador no funciona de forma independiente; requiere el modelo base Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA, que a su vez hereda la licencia Gemma.
- Escalado con metadatos: el adaptador almacena `alpha/r = 2` en los metadatos GGUF, y llama.cpp lo multiplica por la escala del usuario. Si el cargador ignora estos metadatos, hay que dividir todos los valores de escala por la mitad.

## Enlaces

- [HuggingFace - SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2-GGUF](https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2-GGUF)
- [Modelo base - Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-GGUF](https://huggingface.co/Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-GGUF)
- [Adaptador v1 - SubMaroon/Dark-Goetia-26B-A4B-LoRA-v1](https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v1)
- [Adaptador v3-A - SubMaroon/Dark-Goetia-26B-A4B-LoRA-v3-A](https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v3-A)
- [Adaptador v3-B - SubMaroon/Dark-Goetia-26B-A4B-LoRA-v3-B](https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v3-B)
- [LLM Explorer - Dark Goetia 26B A4B LoRA V2](https://llm-explorer.com/model/SubMaroon%2FDark-Goetia-26B-A4B-LoRA-v2,4ekrYZWjvsBUTeXPftIklg)
- [LLM Explorer - Dark Goetia 26B A4B V2 (modelo base)](https://llm-explorer.com/model/26B-Suite%2FDark-Goetia-26B-A4B-v2,4jKrd0ESJ6M9VrfeTcDy93)
- [FriendliAI - API e inferencia](https://friendli.ai/models/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2)
- [Preset de Marinara para SillyTavern](https://github.com/SpicyMarinara/SillyTavern-Settings/blob/main/Marinara%27s%20Essentials/Preset/Marinara%27s%20Spaghetti%20Recipe.json)
