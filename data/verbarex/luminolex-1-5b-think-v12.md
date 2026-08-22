# VERBAREX/LuminoLex-1.5B-think-v12

## Resumen

LuminoLex-1.5B-think-v12 es un modelo de lenguaje causal de 1.500 millones de parámetros nominales (898 millones reales en pesos safetensors) desarrollado por la organización VERBAREX. Se trata de un checkpoint completo, sin adaptadores, basado en `Lernex/Metis-1.5-think`, al que se le ha aplicado un ajuste de identidad que añade una política de identidad LuminoLex/VERBAREX, negaciones explícitas de Metis cuando se pregunta al respecto, y un pequeño conjunto de razonamiento visible verificado.

El modelo está diseñado para tareas de razonamiento y conversación, manteniendo intacta la distribución de razonamiento del modelo base al no degradarla mediante ajustes de identidad agresivos. Se carga mediante código personalizado (`trust_remote_code=True`) o a través de la clase `LuminoLexChat` incluida en el repositorio. Es un modelo reciente, sin descargas ni validación comunitaria, y su licencia no está declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), densa, basada en Metis-1.5-think |
| Parametros totales | 898.051.168 (pesos en safetensors; el nombre sugiere 1,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repositorio solo contiene safetensors de precisión completa) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso que reutiliza los pesos del checkpoint `Lernex/Metis-1.5-think`. La innovación principal no está en la arquitectura base, sino en el post-entrenamiento: se aplica un ajuste de identidad (identity tuning) que inyecta la política de identidad LuminoLex/VERBAREX, denegaciones explícitas de Metis solo cuando se pregunta, y un conjunto verificado de razonamiento visible. Los pesos del transformer se mantienen frescos, es decir, no se aplican adaptadores LoRA ni modificaciones de pesos, de modo que la distribución de razonamiento original no se degrada.

El cargador `model/policy.py` añade la lógica de política en el momento de la generación, tanto si se usa la clase `LuminoLexChat` como si se usa el registro `AutoModelForCausalLM` con `trust_remote_code=True`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto causal con razonamiento visible: el modelo produce cadenas de razonamiento intermedias antes de la respuesta final.
- Conversación multi-turno mediante la clase `LuminoLexChat`, que gestiona el contexto de forma nativa.
- Política de identidad integrada: responde como LuminoLex/VERBAREX y deniega explícitamente ser Metis cuando se le pregunta.
- Razonamiento verificado: incluye un pequeño conjunto de ejemplos de razonamiento validados manualmente.
- Integración con `transformers` mediante código personalizado (custom code), con dos vías de acceso: la clase `LuminoLexChat` o el loader estándar con `trust_remote_code=True`.
- Sin soporte declarado de tool calling, function calling, vision, audio ni capacidades multimodales.

## Casos de uso

- **Asistente conversacional con identidad corporativa**: el modelo puede servir como base para un chatbot de marca que mantenga una identidad consistente (LumioLex) y que responda de forma coherente sobre su origen, gracias a la política de identidad integrada.
- **Prototipos de razonamiento visible**: al generar cadenas de razonamiento intermedias, es útil para investigar cómo los modelos pequeños estructuran el pensamiento paso a paso en tareas de lógica y matemáticas.
- **Evaluación de técnicas de post-entrenamiento**: al ser un checkpoint completo sin adaptadores, permite comparar el impacto del ajuste de identidad frente al modelo base Metis-1.5-think en entornos de investigación.
- **Aplicaciones educativas de razonamiento**: puede servir en herramientas de tutoría donde se muestre al estudiante el proceso de razonamiento antes de la respuesta final, gracias al modo de razonamiento visible.
- **Pruebas de integración con `transformers`**: al usar `trust_remote_code=True`, es un banco de pruebas para validar flujos de despliegue con modelos que requieren código personalizado en entornos de CI/CD.
- **Bases para fine-tuning posterior**: al estar disponible como checkpoint completo en formato safetensors, puede servir como punto de partida para ajustes adicionales con técnicas como LoRA o PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han encontrado comparaciones cuantitativas con modelos similares en la documentación pública.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 898M de parámetros en fp16, se requieren aproximadamente 1,8 GB de VRAM solo para los pesos; en fp32 se necesitan unos 3,6 GB. Con cuantización int4 (no disponible en el repositorio) se podría reducir a unos 450 MB.
- **GPU recomendadas**: cualquier GPU con 4 GB de VRAM o más es suficiente; por ejemplo, una NVIDIA RTX 3060 (12 GB) o RTX 4090 (24 GB) ejecutaría el modelo con comodidad. También funciona en GPUs integradas con suficiente memoria compartida.
- **Cabe en consumer GPU**: sí, es un modelo pequeño que cabe en cualquier GPU de gama media actual.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True`, o la clase `LuminoLexChat` incluida en el repositorio. No se proporcionan archivos GGUF ni configuraciones para llama.cpp, Ollama o vLLM; para usarlos habría que convertir los pesos previamente.
- **Latencia y throughput**: no se han publicado datos de latencia ni throughput. Con un modelo de menos de 1B de parámetros, se espera una generación fluida en GPUs modernas, pero los números concretos no están disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento visible | Licencia | Formato |
|---|---|---|---|---|---|
| LuminoLex-1.5B-think-v12 | 898M (pesos) | No disponible | Sí (set verificado) | No disponible | Safetensors |
| Metis-1.5-think (base) | No disponible | No disponible | Sí (razonamiento original) | No disponible | Safetensors |
| LuminoLex-14B-VERBAREX | 14B (Qwen3-14B) | No disponible | Sí (razonamiento zero-shot) | No disponible | No disponible |
| VibeThinker-1.5B | 1,5B | No disponible | Sí (razonamiento robusto) | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos (benchmarks) para ninguna de estas alternativas en la información disponible.

## Limitaciones y advertencias

- **Licencia no declarada**: no se puede determinar si el modelo es de uso libre o restringido. No se recomienda su uso en producción comercial sin aclarar los términos de la licencia.
- **Dependencia de código personalizado**: el modelo requiere `trust_remote_code=True` o la clase `LuminoLexChat` incluida en el repositorio, lo que implica ejecutar código no auditado por Hugging Face. Esto supone un riesgo de seguridad en entornos de producción.
- **Sin benchmarks publicados**: no hay evidencia de rendimiento en tareas estándar de razonamiento, código o matemáticas, lo que dificulta evaluar su calidad objetiva.
- **Idiomas no especificados**: no se indica qué idiomas soporta el modelo ni si su rendimiento es consistente en varios idiomas.
- **Riesgo de alucinación**: al ser un modelo de razonamiento visible, puede generar cadenas de razonamiento plausibles pero incorrectas; el conjunto de razonamiento verificado es pequeño y no garantiza la corrección en todos los casos.
- **Sesgos desconocidos**: no se ha publicado ninguna evaluación de sesgos ni de comportamiento ético.
- **Adopción nula**: con cero descargas y cero likes en el momento de la consulta, el modelo no tiene validación comunitaria y puede contener errores no detectados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VERBAREX/LuminoLex-1.5B-think-v12
- Perfil de la organización VERBAREX: https://huggingface.co/VERBAREX
- Modelo LuminoLex-14B-VERBAREX: https://huggingface.co/VERBAREX/LuminoLex-14B-VERBAREX
- Sitio web de LuminoLex AI: https://luminolexai.com/
