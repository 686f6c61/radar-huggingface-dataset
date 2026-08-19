# thunquant/qwen3.5-4B-super-coder

## Resumen

`qwen3.5-4B-super-coder` es un modelo de lenguaje especializado en generación de código y llamada a herramientas, publicado por el usuario `thunquant` en Hugging Face como una cuantización GGUF de 4 bits (Q4_0) del modelo base `Qwen/Qwen3.5-4B`. El modelo ha sido refinado mediante un proceso de destilación en varias fases a partir de Claude Sonnet 4.6 y Opus 4.6, combinado con un ajuste fino supervisado (SFT) orientado a tareas de programación, tool calling y razonamiento visible. Su arquitectura híbrida, que alterna capas de Gated DeltaNet y de atención completa, reduce drásticamente el uso de caché KV, lo que lo hace especialmente adecuado para ejecución en dispositivos móviles y de bajo consumo.

Con un tamaño de aproximadamente 2,6 GB en su formato cuantizado y una ventana de contexto nativa de 32K tokens (extensible a 262K o 1M mediante YaRN), el modelo está pensado para entornos con recursos limitados, como teléfonos móviles de gama alta, tablets o portátiles. La versión cuantizada publicada por `thunquant` se complementa con un adaptador LoRA del repositorio `jica98/qwen3.5-4B-super-coder`, que contiene el modelo en BF16 y los pesos de entrenamiento.

El modelo destaca por su capacidad de generar código limpio y comentado en varios lenguajes, su soporte de tool calling con salida JSON conforme a esquemas, y su modo de razonamiento visible (thinking mode) que planifica antes de responder. Aunque no se han publicado benchmarks cuantitativos, la combinación de destilación y ajuste específico para tareas de programación lo posiciona como una opción práctica para desarrollo asistido en entornos locales y de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 3 capas Gated DeltaNet + 1 capa de atención completa (repetidas), sobre base Qwen3.5-4B |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32K (nativa), extensible a 262K/1M via YaRN |
| Tipos de cuantizacion | Q4_0 (GGUF); también existe versión BF16 (safetensors) en el repo jica98 |
| Idiomas soportados | no disponible (no se especifica en la documentación) |
| Licencia | apache-2.0 (según la model card) |
| Formato de pesos | GGUF (Q4_0) y safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.5-4B` emplea una arquitectura híbrida que alterna tres capas de Gated DeltaNet y una capa de atención completa de manera repetitiva. Este diseño reduce la cantidad de caché KV almacenada (solo 8 de las 32 capas guardan caché completa), lo que implica un uso de memoria muy bajo (~0,4 GB para 32K de contexto) y facilita la ejecución en dispositivos con limitaciones de RAM.

El proceso de entrenamiento de `qwen3.5-4B-super-coder` se llevó a cabo en varias fases de destilación y SFT:

1. **Fase 1 (Destilación general)**: Se utilizó el dataset `clzoro/Claude-Distills` (140K muestras) con respuestas de Claude Sonnet 4.6 y Opus 4.6 para transferir estilo, instrucciones y habilidades de razonamiento. El subconjunto Opus (21K) aportó trazas de bloques `thinking` para establecer el modo de razonamiento visible.
2. **Fase 2 (Especialización en código y herramientas)**: Se usó una mezcla de 77K muestras (55K de instrucciones de código, 13K de tool calling y 9K de replay anti-olvido) para especializar el modelo en Python, JavaScript, Shell, entre otros, y en la generación de llamadas a funciones estructuradas.
3. **Fase 3 (Precisión de herramientas)**: Un dataset de ~20K muestras con variaciones de esquemas, ejemplos negativos y objetivos JSON estrictos para reducir falsos positivos en tool calling.
4. **Fase 4 (Continuación de especialización)**: Se partió del LoRA de la Fase 3 (`jica98/qwen3.5-4b-claude-distill-lora`) y se entrenó un adaptador adicional con una mezcla de datos de código y herramientas filtrados, más replay de destilación, usando una receta con 1024 tokens de longitud máxima, batch 1, gradiente acumulado 8, learning rate 1e-4 y 1 época.
5. **Fase 5 (Fine-tuning de razonamiento Fable)**: Se afinó el adaptador de la Fase 4 con trazas de razonamiento y agentes del dataset `kelexine/fable-5-sft-traces`, `armand0e/claude-fable-5-claude-code` y `victor/fable-5-boeing-747-trace`. Se usaron 4.267 ejemplos después de filtrar por longitud máxima de 4096 tokens, con batch 1, gradiente 8, learning rate 5e-5, 1 época y optimizador AdamW de 8 bits.

## Capacidades

- Generación de código en Python, C++, Rust, JavaScript, Shell y otros lenguajes, con énfasis en código limpio, eficiente y comentado.
- Razonamiento visible (thinking mode): el modelo genera bloques `thinking` internos antes de producir la respuesta final, útil para tareas complejas de programación.
- Tool calling fiable: capacidad de generar llamadas a funciones en formato JSON conforme a esquemas definidos, con reducción de falsos positivos.
- Soporte para agentes y razonamiento multi-paso: gracias al entrenamiento con trazas de agentes (Fable) y la destilación de Claude, puede ejecutar secuencias de razonamiento encadenadas.
- Capacidades multilingües: no documentadas explícitamente, pero al estar basado en Qwen3.5 se presume soporte de varios idiomas (no confirmado).
- Ejecución en dispositivos de borde: el bajo consumo de VRAM y KV cache lo hace apto para móviles y tablets con 8GB de RAM o más.
- Compatibilidad con la mayoría de frameworks de inferencia (llama.cpp, Ollama, vLLM, etc.) gracias a su formato GGUF.

## Casos de uso

- **Asistente de programación en IDE**: El modelo puede integrarse en editores de código (VS Code, Neovim) mediante plugins que usan la API de llama.cpp o Ollama. Su capacidad de tool calling permite autocompletar funciones y generar código completo a partir de descripciones en lenguaje natural, con el modo thinking para planificar soluciones complejas.
- **Automatización de desarrollo en CI/CD**: Soporta la generación de scripts y fragmentos de código en pipelines de integración continua. Su bajo requisito de memoria permite ejecutarlo en runners de bajo coste (por ejemplo, Raspberry Pi o instancias cloud pequeñas).
- **Chatbots de soporte técnico**: Con tool calling, puede gestionar conversaciones multi-turno y consultar bases de conocimiento externas mediante llamadas a APIs, manteniendo el contexto de 32K tokens para conversaciones largas.
- **Aplicaciones móviles de asistencia de código**: Gracias a su peso de 2,6 GB y a su KV cache reducido, puede ejecutarse localmente en un iPhone 15 Pro o un Android de gama alta, permitiendo autocompletar código y responder preguntas técnicas sin conexión.
- **Entornos de desarrollo embebidos**: En dispositivos con limitaciones de memoria (por ejemplo, robots, drones o sistemas de automatización), el modelo puede proporcionar razonamiento y generación de código in situ.
- **Análisis de código y refactorización**: Puede recibir un fragmento de código y generar una versión optimizada o documentada, aprovechando el modo thinking para explicar los cambios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del modelo no incluye métricas cuantitativas (como MMLU, HumanEval o GSM8K) para comparar con otros modelos. Se recomienda realizar una evaluación propia en los casos de uso objetivo antes de desplegarlo en producción.

## Requisitos de hardware

- **VRAM estimada para inferencia**: Al ser un modelo de 4B parámetros cuantizado en Q4_0 (~2.6 GB), la VRAM necesaria es aproximadamente de 3-4 GB para una ventana de contexto de 32K, considerando el overhead de la caché KV (~0.4 GB). En cuantización BF16 (sin cuantizar) se necesitarían unos 8-9 GB.
- **GPU recomendadas**: Puede ejecutarse en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4090 (24 GB) sin problemas. Para móviles, se recomienda dispositivos con al menos 8 GB de RAM unificada (Apple M1+ o Android con 12 GB).
- **Compatibilidad con hardware consumer**: Sí, cabe en GPUs de gama media y en dispositivos móviles de gama alta.
- **Opciones de despliegue**: Se puede usar con llama.cpp, Ollama, vLLM, TGI y frameworks compatibles con GGUF. El repositorio jica98 también ofrece compatibilidad con `lemonade run`.
- **Latencia y throughput**: No se han publicado datos específicos. En una GPU RTX 4090 se puede esperar una velocidad de generación de 40-60 tokens/segundo con Q4_0, mientras que en un móvil de gama alta (iPhone 15 Pro) podría alcanzar 10-20 tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4B-super-coder (thunquant) | 4.3B | 32K (ext. 262K) | GGUF Q4_0, BF16 | apache-2.0 | Hugging Face |
| Qwen3.5-4B (base) | 4.3B | 32K (ext. 262K) | safetensors, GGUF | apache-2.0 | Hugging Face |
| Qwen2.5-Coder-3B | 3.6B | 32K | safetensors, GGUF | apache-2.0 | Hugging Face |
| CodeGemma 2B | 2.6B | 8K | safetensors, GGUF | Gemma | Google |

La comparativa se basa en datos públicos; el modelo supera en contexto y en especialización de tool calling al Qwen2.5-Coder-3B, aunque ambos están orientados a código. El modelo `qwen3.5-4B-super-coder` destaca por su destilación de Claude y su baja huella de memoria, pero no se dispone de benchmarks para comparar rendimiento directo.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: Como todo modelo destilado, puede heredar sesgos de los datos de entrenamiento (Claude Distills) y generar respuestas incorrectas o inventadas en tareas de código complejas. Se recomienda verificar siempre el código generado.
- **Riesgo de sobreajuste en tool calling**: Aunque se ha entrenado para reducir falsos positivos, aún puede fallar en esquemas muy complejos o en llamadas de herramientas poco frecuentes.
- **Limitaciones de idioma**: No se documentan los idiomas soportados; el modelo puede funcionar bien en inglés y español, pero su rendimiento en otros idiomas no está garantizado.
- **Licencia**: Aunque la model card indica licencia apache-2.0, el campo de licencia en Hugging Face aparece como "no disponible". Se debe verificar la licencia antes de uso comercial.
- **Cuantización**: La versión GGUF Q4_0 puede degradar la calidad en tareas de razonamiento avanzado en comparación con la versión BF16. Para producción crítica, se recomienda usar el modelo sin cuantizar.
- **Dependencia de la destilación**: El modelo se basa en destilación de Claude (propietario), lo que puede implicar restricciones éticas o legales en algunos contextos (aunque la licencia apache-2.0 lo permite).
- **Sin benchmarks publicados**: No hay evidencia cuantitativa de su rendimiento en tareas de código estándar (HumanEval, MBPP, etc.). Cualquier afirmación de superioridad debe verificarse con pruebas propias.

## Enlaces

- [Modelo GGUF en Hugging Face (thunquant/qwen3.5-4B-super-coder)](https://huggingface.co/thunquant/qwen3.5-4B-super-coder)
- [Modelo BF16 y adaptadores LoRA (jica98/qwen3.5-4B-super-coder)](https://huggingface.co/jica98/qwen3.5-4B-super-coder)
- [Ficha en ThinkLLM](https://thinkllm.dev/models/qwen3-5-4b-super-coder)
- [LLM Explorer - Ficha de jica98](https://llm-explorer.com/model/jica98%2Fqwen3.5-4B-super-coder,3MeanQatsYzHrKxmxdFJoZ)
- [Página de Qwen3.5 en Ollama](https://ollama.com/library/qwen3.5:4b)
