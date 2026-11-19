# xl-24/gemma4-2b-atc-finetune-32-64-v2

## Resumen

`xl-24/gemma4-2b-atc-finetune-32-64-v2` es un ajuste fino (fine-tuning) del modelo base `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, una variante cuantizada a 4 bits de la familia Gemma 4 de Google, publicada por el usuario xl-24. El modelo se ha entrenado con la librería Unsloth y el framework TRL, y se distribuye en formato safetensors bajo licencia Apache 2.0. El nombre del repositorio sugiere un ajuste orientado a tareas de control de tráfico aéreo (ATC, *Air Traffic Control*) con una ventana de contexto o configuración de 32-64, aunque la model card no documenta explícitamente el dataset ni la tarea concreta.

El modelo parte de una variante *instruction-tuned* (sufijo `-it`) de Gemma 4 de aproximadamente 2 mil millones de parámetros (según el identificador `E2B`), por lo que hereda las capacidades de generación de texto, razonamiento y seguimiento de instrucciones del modelo original. Al ser un ajuste fino de un modelo ya cuantizado a 4 bits, su huella en disco es reducida (0,3 GB en el repositorio), lo que facilita su despliegue en hardware modesto.

La relevancia de esta ficha es limitada: se trata de un modelo de nicho, sin descargas ni *likes* en el momento de la consulta, y con documentación muy escasa. No se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento, por lo que cualquier evaluación de su rendimiento debe realizarse de forma empírica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; detalles específicos no disponibles) |
| Parametros totales | ~2 mil millones (inferido del identificador `E2B`; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el sufijo `32-64` podría referirse a la configuración de entrenamiento, pero no se especifica) |
| Tipos de cuantizacion | El modelo base está cuantizado a 4 bits (bnb-4bit); el ajuste fino se distribuye en safetensors, cuantización exacta no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits (bitsandbytes) del modelo Gemma 4 de Google en su variante *instruction-tuned* de ~2B parámetros. La arquitectura subyacente es un transformer decoder-only de la familia Gemma 4, aunque la model card no detalla capas, dimensiones ocultas ni mecanismos de atención específicos.

El entrenamiento se realizó con Unsloth (que optimiza el fine-tuning de modelos grandes reduciendo el uso de memoria y acelerando el proceso) y TRL (Transformer Reinforcement Learning, de Hugging Face). El autor afirma que el modelo se entrenó "2x faster with Unsloth", pero no se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El nombre del repositorio (`atc-finetune-32-64-v2`) sugiere un ajuste orientado a control de tráfico aéreo, pero no hay confirmación documental.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Gemma 4 instruction-tuned.
- Razonamiento y seguimiento de instrucciones (capacidad del modelo base, no verificada tras el ajuste fino).
- Generación de código y matemáticas (capacidad del modelo base, no verificada).
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.
- Posible especialización en tareas de control de tráfico aéreo (ATC) por el nombre del repositorio, sin documentación que lo confirme.

## Casos de uso

- **Prototipado de asistentes especializados en dominios técnicos**: el ajuste fino sobre un modelo instruction-tuned de ~2B permite experimentar con asistentes de nicho (por ejemplo, control de tráfico aéreo) en hardware de consumo, aunque la falta de documentación exige validación empírica.
- **Generación de texto en inglés con requisitos de baja latencia**: al ser un modelo de ~2B parámetros cuantizado a 4 bits, puede desplegarse en GPU de gama media para tareas de generación de texto en tiempo real.
- **Fine-tuning iterativo y experimentación**: al estar construido con Unsloth y TRL, sirve como punto de partida para nuevos ajustes finos sobre el mismo dominio, reutilizando el pipeline de entrenamiento.
- **Evaluación de modelos pequeños en entornos con restricciones de memoria**: su reducido tamaño (0,3 GB en el repositorio) permite ejecutarlo en entornos con VRAM limitada o incluso en CPU con cuantización adicional.
- **Investigación sobre cuantización y ajuste fino**: útil para estudiar el impacto del fine-tuning sobre checkpoints ya cuantizados a 4 bits, comparando el rendimiento antes y después del ajuste.
- **Generación de documentación técnica en inglés**: si el ajuste fino ha preservado las capacidades del modelo base, podría emplearse para redactar textos técnicos breves, aunque requiere validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de ~2B parámetros cuantizado a 4 bits, se estima un uso de VRAM en torno a 2-4 GB para inferencia en precisión de 4 bits (estimación orientativa; no confirmada por el autor).
- **GPU recomendadas**: GPU de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores; GPU profesionales como A100 o H100 no son necesarias para este tamaño.
- **¿Cabe en GPU de consumo?**: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque no hay confirmación oficial.
- **Opciones de despliegue**: transformers (librería declarada), text-generation-inference (tag incluido), y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no disponibles en el repositorio).
- **Latencia y throughput estimados**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `xl-24/gemma4-2b-atc-finetune-32-64-v2` | ~2B (inferido) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino de nicho, documentación escasa |
| `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit` (modelo base) | ~2B | no disponible | Apache 2.0 (heredada) | Hugging Face | Modelo base instruction-tuned cuantizado a 4 bits |
| Gemma 2B (generación anterior de Google) | ~2B | 8K (típico en la familia) | Gemma Terms of Use | Hugging Face, amplia adopción | Alternativa consolidada de tamaño similar |
| Qwen2.5-1.5B-Instruct | ~1.5B | 32K | Apache 2.0 | Hugging Face, amplia adopción | Alternativa multilingüe con contexto mayor |

## Limitaciones y advertencias

- **Documentación insuficiente**: la model card no describe el dataset de entrenamiento, la tarea concreta ni los hiperparámetros, lo que dificulta evaluar su calidad y reproducibilidad.
- **Sesgos conocidos**: no documentados; al heredar del modelo base Gemma 4, puede presentar sesgos similares a los de la familia, pero no hay análisis específico.
- **Riesgo de alucinación**: no evaluado; los modelos de ~2B parámetros tienden a alucinar en tareas de razonamiento complejo, y el ajuste fino sobre un dominio técnico podría aumentar este riesgo si el dataset era limitado.
- **Limitaciones de idioma**: solo se declara inglés (`en`); no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base (`unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`) no imponga restricciones adicionales heredadas de los términos de Gemma.
- **Caveats para producción**: sin benchmarks ni evaluación independiente, no se recomienda su uso en producción sin una validación exhaustiva previa; el modelo tiene 0 descargas y 0 *likes*, lo que indica ausencia de validación por la comunidad.
- **Cuantización previa**: al partir de un checkpoint cuantizado a 4 bits, el ajuste fino puede haber degradado capacidades del modelo original; no hay comparación documentada.

## Enlaces

- [Hugging Face: xl-24/gemma4-2b-atc-finetune-32-64-v2](https://huggingface.co/xl-24/gemma4-2b-atc-finetune-32-64-v2)
- [Modelo base: unsloth/gemma-4-E2B-it-unsloth-bnb-4bit](https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL (Hugging Face)](https://github.com/huggingface/trl)
