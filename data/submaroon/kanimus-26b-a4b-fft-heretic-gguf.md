# SubMaroon/Kanimus-26B-A4B-FFT-heretic-GGUF

## Resumen

Kanimus-26B-A4B-FFT-heretic es un modelo de lenguaje experimental orientado a roleplay oscuro, desarrollado por SubMaroon a partir de una fusión manual de proyecciones de atención (Query y Key) mediante task-arithmetic, combinada con la integración de una LoRA estilística. El modelo se basa en Gemma 4 26B A4B, una arquitectura MoE de 26 000 millones de parámetros totales con 4 000 millones activos, y hereda la licencia Gemma de Google.

La propuesta principal del modelo es ofrecer una alternativa sin filtros para roleplay en inglés y ruso, con un estilo narrativo oscuro y atmosférico, manteniendo la coherencia de la escena y una alta iniciativa por parte de los personajes no jugadores (NPC). El autor aplica una inyección controlada de las proyecciones QK a partir de una destilación de Claude Opus, con coeficientes α diferenciados para atención deslizante y global, y posteriormente funde una LoRA de estilo en los pesos finales.

Este lanzamiento es relevante para la comunidad de roleplay y escritura creativa que busca modelos especializados con licencia permisiva (Gemma) y capacidad de ejecución en hardware de consumo gracias a la cuantización GGUF. El repositorio actual ofrece la versión cuantizada Q4_K_M, mientras que la versión BF16 completa está disponible por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 26B A4B (MoE, transformer) |
| Parametros totales | 25 233 142 046 (~25,2B) |
| Parametros activos | 4B (segun nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | ingles, ruso |
| Licencia | Gemma |
| Formato de pesos | GGUF (Q4_K_M); version BF16 en safetensors disponible por separado |

## Arquitectura y entrenamiento

El modelo parte de la base Vortex5/Gemma-4-26B-A4B-Animus-V14.1-FFT-heretic, que a su vez deriva de Gemma 4 26B A4B de Google. La arquitectura es un transformer MoE con 26B parámetros totales y 4B activos por token, con atención deslizante y global. El proceso de construcción consta de dos pasos:

1. **Inyección QK mediante task-arithmetic**: se aplica la fórmula `W_final = W_animus + α * (W_opus - W_unsloth)` exclusivamente sobre las proyecciones de Query y Key de la atención. Los coeficientes α son: 0,50 para Q y K deslizantes, 0,50 para Q global y 0,25 para K global (este último reducido para mitigar el colapso de la inyección KV en contextos largos). El merge se ejecuta en FP32 y los pesos finales se guardan en bfloat16. Todos los tensores no-QK (router MoE, MLP compartido, embeddings y normas) permanecen bitwise idénticos al base Animus-heretic, verificado con `torch.equal`.

2. **Fusión de LoRA estilística**: se integra la LoRA `SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4` directamente en los pesos mediante `set_scale("default", 0.20)` y `merge_and_unload(safe_merge=True)`, con un peso efectivo de 0,40 * BA (considerando alpha/r = 2).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de RLHF o DPO. El modelo es un merge y no un entrenamiento desde cero.

## Capacidades

- Generación de texto narrativo y descriptivo con estilo oscuro y atmosférico.
- Roleplay en inglés y ruso, manteniendo la lógica de escena y coherencia argumental.
- Alta iniciativa de NPC: los personajes no jugadores toman acciones proactivas dentro de la narrativa.
- Soporte multilingüe limitado a inglés y ruso (según la model card).
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio.
- No se menciona un modo de razonamiento explícito (thinking mode).

## Casos de uso

- **Roleplay interactivo en inglés o ruso**: el modelo gestiona conversaciones multi-turno con personajes, manteniendo el tono oscuro y la iniciativa de los NPC. Es adecuado para juegos de texto, chats de rol y narrativa colaborativa.
- **Escritura creativa de ficción oscura**: puede generar relatos, escenas y diálogos con atmósfera gótica, terror o fantasía sombría, aprovechando el estilo estilístico integrado.
- **Desarrollo de personajes para juegos de rol**: el modelo puede crear perfiles de personajes, historias de fondo y arcos narrativos coherentes con el tono del juego.
- **Traducción creativa entre inglés y ruso**: al estar entrenado en ambos idiomas, puede adaptar textos narrativos manteniendo el registro y la atmósfera, aunque no es un traductor general.
- **Generación de contenido para campañas de rol de mesa**: el modelo puede actuar como director de juego automatizado, describiendo escenarios, reacciones de NPC y consecuencias de las acciones de los jugadores.
- **Prototipado de chatbots con personalidad oscura**: su estilo distintivo permite crear asistentes conversacionales con una voz narrativa particular, útil para demos o proyectos artísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- El archivo GGUF Q4_K_M ocupa 16,8 GB, por lo que cabe en GPUs de consumo con 16-24 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, o GPUs de datacenter como A10G o L4).
- La versión BF16 completa (~53 GB) requiere GPUs de datacenter con 80 GB de VRAM (A100, H100) o inferencia en CPU con memoria suficiente.
- Para el GGUF Q4_K_M, se recomienda al menos 20 GB de VRAM para dejar margen al contexto y a la caché KV.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), text-generation-inference (TGI) si se convierte a safetensors.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. A continuación se presenta una comparación cualitativa con el modelo base y otras variantes de la misma familia:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Kanimus-26B-A4B-FFT-heretic (este) | 25,2B totales, 4B activos | no disponible | Gemma | Roleplay oscuro, merge QK + LoRA |
| Vortex5/Gemma-4-26B-A4B-Animus-V14.1-FFT-heretic | 25,2B totales, 4B activos | no disponible | Gemma | Base Animus-heretic, roleplay |
| Arue-2026/gemma-4-26B-A4B-it-ultra-uncensored-heretic-GGUF | 25,2B totales, 4B activos | no disponible | Gemma | Variante sin censura, roleplay |

No se dispone de información sobre el contexto exacto de estos modelos ni de sus resultados en benchmarks.

## Limitaciones y advertencias

- El modelo está diseñado para roleplay oscuro y puede generar contenido explícito, violento o perturbador. No es adecuado para aplicaciones comerciales orientadas a un público general sin moderación.
- No se han documentado sesgos específicos, pero al ser un modelo derivado de Gemma 4 y de destilaciones de Claude Opus, puede heredar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, nombres o detalles inconsistentes, especialmente en contextos largos.
- La licencia Gemma impone restricciones de uso comercial según los términos de Google. Es necesario revisar la licencia completa antes de desplegar el modelo en producción.
- El modelo solo soporta inglés y ruso; no se garantiza un rendimiento adecuado en otros idiomas.
- La longitud de contexto no está especificada en la documentación disponible; se recomienda probar con contextos cortos y medios para evitar degradación.
- El proceso de merge es experimental y no se han publicado evaluaciones formales de calidad o seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SubMaroon/Kanimus-26B-A4B-FFT-heretic-GGUF
- Modelo base: https://huggingface.co/Vortex5/Gemma-4-26B-A4B-Animus-V14.1-FFT-heretic
- Base Animus V14.1 (Darkhn): https://huggingface.co/Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT
- Destilación Opus (TeichAI): https://huggingface.co/TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2
- LoRA Dark-Goetia: https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4-GGUF
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
