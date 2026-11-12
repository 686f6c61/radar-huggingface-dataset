# ToolW/desi-agent-tinyaya-sft-lora

## Resumen

ToolW/desi-agent-tinyaya-sft-lora es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base CohereLabs/tiny-aya-global. Lo publica el usuario ToolW en Hugging Face y está empaquetado con la librería PEFT, de modo que no contiene pesos completos sino los deltas de bajo rango que deben fusionarse con el modelo base para su uso. El repositorio ocupa 0,2 GB y declara 30.228.480 parámetros en el fichero safetensors, un dato que corresponde al conjunto de tensores del adaptador, no al modelo completo.

El interés de esta ficha es limitado pero conviene ser explícito: la model card es la plantilla por defecto de Hugging Face sin cumplimentar, no hay licencia declarada, no se especifican idiomas, dataset de entrenamiento, hiperparámetros ni resultados de evaluación. El modelo no registra descargas ni likes en el momento de la consulta. Cualquier evaluación de idoneidad para producción debe partir, por tanto, del modelo base tiny-aya-global y no de este adaptador.

La relevancia actual es la de un artefacto de experimentación: un SFT sobre un modelo pequeño multilingüe de Cohere, útil como ejemplo de flujo PEFT y como punto de partida reproducible, pero sin garantías documentadas de calidad, licencia o comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer CohereLabs/tiny-aya-global |
| Parámetros totales | 30.228.480 (tensores del adaptador en safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada aquí) |
| Tipos de cuantización | no disponible (el repo incluye safetensors y GGUF, según tags) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF (según tags) |
| Librería | peft 0.21.2 |
| Modelo base | CohereLabs/tiny-aya-global |
| Tamaño del repo | 0,2 GB |
| Pipeline | text-generation |
| Fecha de creación | 2026-11-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, matrices de bajo rango insertadas en las capas del transformer base, entrenadas con ajuste supervisado (SFT, según el identificador del modelo). La arquitectura subyacente es la del modelo CohereLabs/tiny-aya-global, un transformer de la familia Aya de Cohere Labs orientada a cobertura multilingüe; los detalles concretos de número de capas, dimensión oculta y ventana de contexto no se documentan en este repositorio y deben consultarse en la ficha del modelo base.

No hay información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos, la existencia de RLHF o DPO posterior, ni los hiperparámetros del SFT (rango LoRA, alpha, tasa de aprendizaje, épocas). La model card mantiene los campos "[More Information Needed]" en todas las secciones de detalles, datos y procedimiento. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). El único dato verificable de configuración es la versión de PEFT empleada (0.21.2).

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y los tags incluyen conversational.
- Ajuste orientado a agentes: el nombre del modelo incluye "agent", lo que sugiere un SFT sobre trazas de agente, aunque no se documenta el dataset ni el formato de herramientas.
- Herencia del modelo base: las capacidades multilingües, de razonamiento y de código dependen íntegramente de tiny-aya-global y no se reivindican de forma explícita en este repositorio.
- Tool calling / function calling: no disponible (no documentado).
- Razonamiento multi-paso y uso como agente autónomo: no disponible (no documentado).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación con PEFT: cargar el adaptador sobre tiny-aya-global con `PeftModel.from_pretrained` para reproducir el flujo de SFT y estudiar cómo afecta el ajuste al comportamiento del modelo base en tareas conversacionales.
- Prototipado de agentes en local: al ser un adaptador pequeño (0,2 GB) sobre un modelo tiny, puede ejecutarse en una GPU de consumo para validar pipelines de agente antes de escalar a modelos mayores.
- Evaluación comparativa de adaptadores: servir como baseline frente a otros LoRA entrenados sobre el mismo modelo base, midiendo degradación o mejora en tareas concretas.
- Formación y docencia: ejemplo mínimo de cómo se publica un adaptador LoRA en Hugging Face con la librería PEFT y cómo se fusiona con el modelo base.
- Investigación sobre multilingüismo: aprovechar la cobertura idiomática de la familia Aya para estudiar el efecto de un SFT específico en idiomas de bajos recursos, siempre que se valide previamente el comportamiento del adaptador.
- Despliegue experimental con llama.cpp u Ollama: el repo incluye un artefacto GGUF según los tags, lo que permitiría probar el modelo fusionado en entornos de inferencia ligera, con la cautela de que no hay validación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,2 GB; la VRAM real la determina el modelo base tiny-aya-global, no disponible en esta ficha. Como referencia orientativa para modelos de la familia "tiny" (del orden de cientos de millones de parámetros), la inferencia en fp16 requiere típicamente menos de 2 GB, pero este dato no está confirmado para tiny-aya-global.
- GPU recomendadas: no disponible. Por el tamaño del adaptador, cualquier GPU consumer reciente (RTX 3060 o superior) debería poder cargar el modelo fusionado si el base es efectivamente pequeño.
- Cabe en GPU consumer: probablemente sí, condicionado al tamaño del modelo base.
- Opciones de despliegue: transformers + peft (nativo), llama.cpp y Ollama si se usa el GGUF incluido, vLLM y TGI solo si se fusiona el adaptador en un checkpoint completo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ToolW/desi-agent-tinyaya-sft-lora | 30.228.480 en adaptador LoRA | no disponible | no disponible | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-global (base) | no disponible en esta ficha | no disponible | no disponible | Hugging Face |
| Otros LoRA sobre tiny-aya-global | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Model card sin cumplimentar: no hay información sobre datos, hiperparámetros, evaluación ni uso previsto, lo que impide auditar el adaptador.
- Licencia no declarada: no puede asumirse uso comercial; debe verificarse la licencia del modelo base y del adaptador antes de cualquier despliegue.
- Riesgo de alucinación: inherente a cualquier modelo generativo; no hay evaluación que lo cuantifique en este adaptador.
- Sesgos: desconocidos; dependen del dataset de SFT, que no se documenta.
- Idiomas: no declarados; la cobertura multilingüe del base no garantiza que el SFT la preserve.
- Sin tracción comunitaria: 0 descargas y 0 likes implican ausencia de validación externa.
- Nombre "agent" sin especificación: no se documenta el formato de herramientas ni el esquema de conversación esperado, por lo que integrarlo en un pipeline de agentes requiere ingeniería inversa.
- Producción: no recomendado sin una evaluación propia previa sobre el modelo fusionado.

## Enlaces

- Hugging Face: https://huggingface.co/ToolW/desi-agent-tinyaya-sft-lora
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
