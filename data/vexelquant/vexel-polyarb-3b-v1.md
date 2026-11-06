# VexelQuant/Vexel-PolyArb-3B-v1

## Resumen

Vexel-PolyArb-3B-v1 es un modelo de lenguaje de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) desarrollado por VexelQuant Research, un laboratorio que se presenta como proveedor de modelos cuantitativos para arbitraje en mercados de predicción y ecosistemas cripto/DeFi. El modelo se construye sobre la familia Qwen2 (según los tags del repositorio) y se afina mediante SFT con Unsloth y GRPO (Group Relative Policy Optimization) para producir salidas deterministas en formato JSON estricto, sin Markdown, orientadas a pipelines de ejecución de alta frecuencia.

El problema que aborda es concreto: los modelos genéricos y las APIs de LLM en la nube introducen Markdown espurio, JSON inválido y latencias altas que rompen los sistemas automatizados de trading. VexelQuant declara una tasa de cumplimiento de JSON estricto del 98,33 % y un 0,0 % de alucinaciones de Markdown, con un contexto de instrucciones de sistema fijo que describe un motor de arbitraje de mercados de predicción. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors y GGUF.

La relevancia del modelo es, sin embargo, difícil de verificar de forma independiente: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, no se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) y las cifras de latencia que el autor presenta como ventaja (p50 de 6171,54 ms) son en realidad peores que las del modelo base genérico que compara (115,0 ms), lo que contradice la afirmación de "sub-20ms" del propio README.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (según tags del repositorio) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se menciona Q4_K_M en el ejemplo de llama.cpp); safetensors en precisión completa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen2 de aproximadamente 3B parámetros, según los tags del repositorio (`qwen2`). Sobre esa base se aplica un ajuste supervisado (SFT) mediante Unsloth y posteriormente un entrenamiento con GRPO (Group Relative Policy Optimization), una variante de optimización por preferencias que no requiere un modelo de recompensa separado y que se ha popularizado para tareas de razonamiento y formato. El objetivo declarado del ajuste es doble: forzar salidas JSON válidas y eliminar por completo el Markdown en las respuestas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la longitud de contexto nativa ni si se aplicaron técnicas adicionales como decodificación especulativa o atención lineal. El prompt de sistema que acompaña al modelo define un rol muy acotado: evaluar reglas de resolución de mercados de predicción, probabilidades implícitas del libro de órdenes y actualizaciones en tiempo real para producir un delta de valor razonable, un riesgo de contestación de oráculo y una acción de ejecución estricta en JSON.

## Capacidades

- Generación de texto con formato JSON estricto y sin Markdown, según la métrica declarada por el autor (98,33 % de cumplimiento).
- Razonamiento acotado a un dominio financiero: arbitraje en mercados de predicción, evaluación de reglas de resolución y riesgo de oráculo.
- Salida determinista con temperatura recomendada de 0,1 y un máximo de 128 tokens nuevos.
- Integración con vLLM y llama.cpp (GGUF), según los ejemplos de la model card.
- Soporte de plantilla de chat tipo ChatML (`<|im_start|>` / `<|im_end|>`), heredada de Qwen2.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Arbitraje en mercados de predicción: el modelo recibe reglas de resolución, probabilidades implícitas del libro y noticias en tiempo real, y devuelve un JSON con el delta de valor razonable y la acción de ejecución, lo que encaja con el rol definido en su prompt de sistema.
- Motor de decisión en bots de trading cripto: al producir JSON estricto sin Markdown, la salida puede parsearse directamente en un pipeline de ejecución sin capa de limpieza intermedia.
- Evaluación de riesgo de oráculo: el modelo está entrenado para estimar el riesgo de contestación de un oráculo en mercados de predicción, un caso concreto de DeFi donde la ambigüedad de resolución es crítica.
- Clasificación y normalización de señales de wire: puede transformar actualizaciones de noticias financieras en estructuras JSON con campos fijos para su consumo por sistemas downstream.
- Prototipado de estrategias cuantitativas: al ser un modelo de 3B con licencia Apache 2.0, permite iterar localmente sobre lógica de arbitraje sin depender de APIs de pago.
- Despliegue en infraestructura propia de baja latencia: con GGUF Q4_K_M y llama.cpp puede ejecutarse en hardware modesto, lo que facilita pruebas de concepto en entornos controlados.
- Fine-tuning propietario: el autor ofrece licencias de "foundry" para ajustar los pesos a estrategias privadas, lo que sugiere un uso como base para adaptaciones internas.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, que comparan el modelo con una base genérica y una API de LLM en la nube. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica | VexelQuant Aligned | Modelo base genérico | API de LLM en la nube |
|---|---|---|---|
| Latencia p50 | 6171,54 ms | 115,0 ms | 920,0 ms |
| Latencia p95 | 6429,25 ms | 185,0 ms | 1450,0 ms |
| Cumplimiento de JSON estricto | 98,33 % | 74,2 % | 91,5 % |
| Alucinaciones de Markdown | 0,0 % | 22,8 % | 8,5 % |

Advertencia: las cifras de latencia del propio modelo son entre 50 y 7 veces peores que las de los sistemas con los que se compara, lo que contradice la afirmación de "sub-20ms" del README y sugiere que las métricas no son directamente comparables o que se midieron en condiciones distintas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6,2 GB solo para pesos, más overhead de KV cache y activaciones (estimación típica de 8-10 GB en total).
- VRAM estimada en GGUF Q4_K_M: aproximadamente 2 GB para pesos, con un total práctico de 3-4 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más en FP16 y en GPUs de 4 GB o más con cuantización Q4.
- Opciones de despliegue: vLLM (ejemplo oficial en la model card) y llama.cpp con GGUF (ejemplo oficial). No se documentan Ollama ni TGI.
- Latencia y throughput: el autor reporta p50 de 6171,54 ms y p95 de 6429,25 ms en su propia configuración, cifras que no permiten hablar de alta frecuencia pese al posicionamiento del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Vexel-PolyArb-3B-v1 | 3,09 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajustado para JSON estricto en dominio cripto |
| Qwen2.5-3B-Instruct | ~3 B | 32 768 tokens (versión estándar) | Apache 2.0 | Hugging Face, ampliamente adoptado | Base generalista, sin ajuste financiero |
| Llama-3.2-3B-Instruct | ~3 B | 128 000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente adoptado | Base generalista, requiere verificación de licencia para uso comercial |
| Phi-3.5-mini-instruct | ~3,8 B | 128 000 tokens | MIT | Hugging Face, ampliamente adoptado | Base generalista con buen rendimiento en razonamiento |

La comparación es aproximada: no hay datos públicos de benchmarks que permitan situar a Vexel-PolyArb-3B-v1 frente a estas alternativas en tareas estándar, y su ventaja declarada se limita al cumplimiento de formato JSON en un dominio muy específico.

## Limitaciones y advertencias

- Las cifras de rendimiento son autoinformadas por el autor y no han sido verificadas de forma independiente; no hay benchmarks estándar publicados.
- La latencia p50 declarada (6171,54 ms) es incompatible con el posicionamiento de "sub-20ms" del README y con un uso real en alta frecuencia.
- El repositorio registra 0 descargas y 0 likes, lo que impide evaluar su adopción o validación por la comunidad.
- El modelo está ajustado para un dominio muy estrecho (arbitraje en mercados de predicción) y puede degradarse fuera de ese contexto.
- No se documentan idiomas soportados ni longitud de contexto, lo que dificulta planificar su integración.
- Riesgo de alucinación en dominios financieros: aunque el autor declara 0 % de alucinaciones de Markdown, no se reportan métricas de fidelidad factual ni de calibración de probabilidades.
- Licencia Apache 2.0 permite uso comercial, pero el autor ofrece licencias "foundry" separadas para pesos personalizados, lo que puede generar confusión sobre qué cubre la licencia abierta.
- No hay información sobre sesgos, datos de entrenamiento ni procesos de evaluación de seguridad.
- El prompt de sistema está codificado en la model card con un rol fijo; usarlo fuera de ese rol puede producir salidas no deseadas.

## Enlaces

- Hugging Face: https://huggingface.co/VexelQuant/Vexel-PolyArb-3B-v1
- Sitio del autor: https://vexelquant.me
- GitHub del autor: https://github.com/VexelQuant
- Contacto comercial: founder@vexelquant.me
