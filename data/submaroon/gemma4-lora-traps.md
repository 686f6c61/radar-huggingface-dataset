# SubMaroon/gemma4-lora-traps

## Resumen

SubMaroon/gemma4-lora-traps es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario SubMaroon sobre el modelo base google/gemma-4-26B-A4B-it, la variante instructiva del Gemma 4 de Google DeepMind. Este adaptador fue creado con un propósito muy concreto: servir como banco de pruebas para documentar un comportamiento técnico poco conocido en la familia Gemma 4, relacionado con la ausencia de la proyección `v_proj` en cinco de las treinta capas del modelo. El autor lo describe como parte del proceso de entrenamiento de sus LoRAs para el "Goetia merge", y el README incluye un informe detallado sobre las implicaciones de esta peculiaridad arquitectónica en la configuración de `target_modules` de PEFT.

El modelo base, Gemma 4, es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 26 000 millones de parámetros totales y 4 000 millones activos por token. Presenta una innovación clave en el mecanismo de atención: en las capas globales (no deslizantes), las claves y valores comparten proyección (`attention_k_eq_v`), lo que elimina la matriz `v_proj` en cinco de las treinta capas. Este adaptador LoRA se ha entrenado sobre esta arquitectura, y el informe adjunto documenta las consecuencias de este diseño en el entrenamiento de adaptadores. El modelo tiene licencia Apache-2.0 y se publicó en agosto de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre Gemma 4 26B-A4B (MoE con 26B totales, 4B activos) |
| Parámetros totales | no disponible (no se especifica el tamaño del adaptador) |
| Parámetros activos | no aplicable (adaptador LoRA) |
| Longitud de contexto | no disponible (heredada del modelo base, 128 000 tokens según el paper de Gemma 4) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (presumiblemente, no confirmado) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base Gemma 4 26B-A4B-it, que emplea una arquitectura Mixture-of-Experts con capas de atención alternadas: 25 capas con atención deslizante (ventana de 1024 tokens) y 5 capas con atención global (índices 5, 11, 17, 23 y 29). La configuración `attention_k_eq_v` está activa, lo que significa que en las capas globales no existe `v_proj`; la proyección de claves (`k_proj`) se reutiliza como valores, aplicando solo RMSNorm adicional. Esto reduce el número de proyecciones de atención de 120 a 115.

El README del autor describe un experimento controlado que reveló que al especificar `"v_proj"` en `target_modules` de PEFT, el adaptador se aplica solo a 25 capas (las deslizantes), no a las 30, y que en las 5 capas globales la matriz `k_proj` actúa como valor. El entrenamiento del LoRA se realizó con el objetivo de crear un merge, pero no se proporcionan detalles sobre el dataset, el número de pasos, el rango o el alpha del adaptador. El autor recomienda verificar manualmente el número de parámetros entrenables cuando se usa `target_modules` con listas fijas.

## Capacidades

- Al ser un adaptador LoRA, el modelo hereda las capacidades del modelo base Gemma 4 26B-A4B-it, que incluyen generación de texto, razonamiento, código, matemáticas y comprensión multimodal (imagen y texto).
- El adaptador se ha entrenado específicamente para modificar el comportamiento del modelo base en tareas no especificadas; el autor lo usa para un "merge" personalizado.
- No se documentan capacidades adicionales como tool calling, agentes o modo razonamiento extendido.
- La documentación del adaptador se centra en el aspecto técnico de la proyección de valores, no en funcionalidades de usuario final.

## Casos de uso

- **Investigación sobre adaptación eficiente**: este adaptador es útil para investigadores que quieran estudiar el comportamiento de LoRA en modelos MoE con atención compartida, especialmente en la configuración `attention_k_eq_v`.
- **Fine-tuning de dominios específicos**: al ser un LoRA, puede aplicarse sobre el modelo base para adaptarlo a dominios concretos (por ejemplo, código, medicina, legal), aunque el autor no proporciona ejemplos de uso.
- **Pruebas de integración con PEFT**: El README documenta un fallo silencioso de PEFT al no advertir sobre la cobertura parcial de `v_proj`. Este adaptador puede servir como caso de prueba para depurar configuraciones de `target_modules`.
- **Investigación sobre KV-cache y eficiencia de memoria**: La arquitectura de Gemma 4 reutiliza claves como valores, lo que reduce el uso de memoria en contextos largos. Este adaptador puede usarse para experimentos sobre el impacto de esta técnica en el fine-tuning.
- **Desarrollo de merges de modelos**: El autor lo creó para su "Goetia merge", por lo que puede ser útil para desarrolladores que buscan combinar múltiples LoRAs en un solo modelo.
- **Educación técnica**: El informe que acompaña al adaptador es un recurso didáctico para entender las capas de atención no uniformes en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README no incluye métricas de rendimiento ni comparaciones con otros adaptadores. Se desconoce el impacto del LoRA en las capacidades del modelo base.

## Requisitos de hardware

- **Fine-tuning**: Según el enlace de gemma4.online, es posible entrenar LoRA/QLoRA en una GPU de consumo como RTX 3090 o RTX 4090 (16-24 GB de VRAM). El adaptador en sí es pequeño, pero el modelo base de 26B-A4B requiere al menos 16 GB de VRAM para cargar en cuantización de 4 bits.
- **Inferencia**: Para usar el adaptador sobre el modelo base, se necesita una GPU con suficiente VRAM para el modelo Gemma 4 (26B-A4B). En cuantización 4 bits, se requieren aproximadamente 15-18 GB de VRAM; en 8 bits, 25-30 GB. Para mayor comodidad, se recomienda A100 (40 GB) o H100 (80 GB).
- **Despliegue**: El adaptador puede cargarse con la biblioteca `peft` de Hugging Face, o con `transformers`. No se mencionan compatibilidades con vLLM, llama.cpp u Ollama, pero al ser un LoRA, puede fusionarse con el modelo base y exportarse a otros formatos.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No hay modelos comparables disponibles. El adaptador es específico para Gemma 4 y no se conocen otros LoRAs públicos que documenten el mismo problema. La comparativa natural sería con el modelo base sin adaptar, pero no se proporcionan métricas de rendimiento.

## Limitaciones y advertencias

- **Cobertura incompleta de `target_modules`**: Si se usa `target_modules` con `"v_proj"`, el adaptador solo se aplica a 25 de las 30 capas, sin advertencia. Esto puede causar un comportamiento asimétrico en el modelo.
- **Comportamiento inesperado en capas globales**: En las capas 5, 11, 17, 23 y 29, `k_proj` actúa como matriz de valores. Un adaptador que no tenga en cuenta esto puede modificar la ruta de valores de forma no intencionada.
- **Riesgo de alucinación**: El modelo base Gemma 4, como cualquier modelo de lenguaje, puede generar contenido falso o inexacto. El adaptador no mitiga este riesgo.
- **Sesgos**: no se proporcionan evaluaciones de sesgo para el adaptador. Se heredan los sesgos del modelo base.
- **Licencia**: Apache-2.0 permite uso comercial, pero el adaptador no incluye documentación de uso o garantías.
- **Sin información sobre entrenamiento**: no se detallan los datos de entrenamiento, el rango del LoRA ni el método de entrenamiento (RLHF, DPO, etc.), lo que limita la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SubMaroon/gemma4-lora-traps)
- [Gemma 4 Technical Report (arXiv)](https://arxiv.org/pdf/2607.02770)
- [Model card oficial de Gemma 4 (Google)](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Guía de fine-tuning con LoRA para Gemma 4](https://gemma4.online/fine-tuning)
- [Página oficial de Gemma 4 (Google DeepMind)](https://deepmind.google/models/gemma/gemma-4/)
