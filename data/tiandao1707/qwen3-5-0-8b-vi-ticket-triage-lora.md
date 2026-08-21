# tiandao1707/qwen3.5-0.8b-vi-ticket-triage-lora

## Resumen

Este modelo es un adaptador LoRA de clasificación de tickets de atención al cliente en vietnamita, construido sobre el modelo base `Qwen/Qwen3.5-0.8B` de la familia Qwen 3.5. Su propósito es recibir un ticket de soporte en vietnamita y devolver un objeto JSON con cuatro campos: `intent`, `urgency`, `product` y `sentiment`. El adaptador fue desarrollado por Lê Quang Đức como parte de un ejercicio de laboratorio (Lab 21) del curso AICB-P2T3, y se publica con fines de reproducción de resultados, no para uso real.

La relevancia del modelo radica en que documenta un caso de estudio de fine-tuning con recursos extremadamente limitados: solo 15 pasos de optimización, sin GPU, y con un presupuesto de entrenamiento de 30 ejemplos efectivos. La model card del autor reconoce explícitamente que el adaptador no supera al modelo base con un prompt optimizado, y que su uso en producción requeriría una validación estricta de las salidas. Por tanto, este modelo es más útil como referencia educativa sobre LoRA y evaluación rigurosa que como componente funcional.

Aunque el modelo base Qwen3.5 es multimodal y de arquitectura híbrida (atención lineal y mezcla de expertos dispersa), este adaptador solo se ha entrenado para la tarea de clasificación de texto en vietnamita, sin uso de visión ni otras modalidades. La licencia es Apache-2.0, lo que permite uso comercial, pero las limitaciones funcionales del adaptador lo desaconsejan para entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-0.8B (transformer multimodal híbrido) |
| Parametros totales | No disponible (adaptador LoRA, 0.1 GB en repo) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (entrenado con `max_length` 512) |
| Tipos de cuantizacion | bf16 (pesos base y del adaptador durante el entrenamiento) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA con PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `Qwen/Qwen3.5-0.8B`, que pertenece a la familia Qwen 3.5 de Alibaba Cloud. Qwen 3.5 es una serie de modelos multimodales con arquitectura híbrida que combina atención lineal y mezcla de expertos dispersa (MoE), con entrenamiento temprano en fusión de tokens multimodales. Sin embargo, este adaptador solo se aplica al decodificador de texto y no usa la torre de visión.

El entrenamiento del adaptador se realizó con la librería PEFT sobre un modelo base con pesos en bf16 y maestros en fp32. La configuración clave es:

- `r=16`, `lora_alpha=32` (invariante α = 2r)
- `target_modules`: todas las capas lineales del decodificador de texto (12 tipos, excluyendo la torre de visión)
- Learning rate `1e-4` (aproximadamente 10 veces la escala del fine-tuning completo)
- 15 pasos de optimización, batch efectivo de 2, `max_length` 512
- Loss mask solo en respuestas (`assistant-only`), con `supervised_fraction` de 0.3936
- Train loss final: 1.3252
- Dataset: 225 tickets de atención al cliente en vietnamita, generados sintéticamente mediante un script determinista (`make_seed_data.py`)

El entrenamiento se ejecutó en CPU (Intel i5-1135G7, 8 GB RAM) con bf16, lo que explica el bajo número de pasos. La model card indica que la hipótesis de falta de datos era incorrecta: un adaptador con `r=64` entrenado con los mismos 30 ejemplos alcanzó un target superior (0.520 vs 0.360), pero sufrió una regresión catastrófica en las capacidades generales (`regression` de 0.067, Δ −0.489). Ninguna de las dos configuraciones es apta para producción.

## Capacidades

- **Clasificación de tickets**: devuelve un JSON con 4 claves (`intent`, `urgency`, `product`, `sentiment`) a partir de un ticket en vietnamita.
- **Generación de texto**: el adaptador genera texto JSON de salida, pero solo para la tarea de clasificación.
- **Formato de salida estable**: el adaptador consigue formato JSON válido en 50/50 casos (frente al 0% del base con prompt corto).
- **Multilingüe**: no, solo vietnamita.
- **No soporta**: tool calling, agentes, razonamiento multi-paso, visión, audio, ni otras tareas. El adaptador se limita a la clasificación de tickets de comercio electrónico.

## Casos de uso

- **Reproducción de resultados académicos**: el adaptador se publica para permitir que otros investigadores reproduzcan los resultados reportados en el laboratorio, sirviendo como ejemplo de evaluación rigurosa de fine-tuning.
- **Enseñanza de LoRA**: sirve como caso práctico para mostrar cómo un adaptador de bajo rango puede fallar en la calidad, y cómo la evaluación comparativa con el base model es esencial.
- **Estudio de alucinaciones en modelos pequeños**: el adaptador genera valores enum inexistentes (p. ej., `thong_tinh`, `tich_tich`), lo que ilustra el fenómeno de alucinación en modelos de 0.8B.
- **Prueba de validación de salidas**: su uso con un sistema de validación de enums puede servir como ejemplo de cómo evitar errores en salidas de modelos generativos.
- **Comparación de coste de entrenamiento**: documenta un escenario sin GPU donde el entrenamiento en CPU es viable pero con limitaciones de calidad.
- **No recomendado**: no es adecuado para atención al cliente real, análisis de sentimiento en producción, ni ninguna tarea comercial, debido a su baja calidad y a la falta de validación de seguridad y sesgos.

## Benchmarks y rendimiento

La model card proporciona una comparación entre el adaptador, el base model con prompt corto y el base model con prompt optimizado. Los resultados se muestran en la siguiente tabla:

| Configuración | target | regression | format | latency (ms) |
|---|---|---|---|---|
| base + prompt corto | 0.000 | 0.556 | 0.000 | 17646.7 |
| base + prompt optimizado | 0.495 | 0.556 | 1.000 | 8797.9 |
| **adaptador LoRA (r=16)** | 0.360 | 0.644 | 1.000 | **7745.8** |

El adaptador mejora el formato (0.000 → 1.000) y reduce la latencia, pero el `target` (precisión en la tarea) es inferior al del base model con prompt optimizado (0.360 vs 0.495). La `regression` (capacidad general) mejora ligeramente (0.556 → 0.644), pero el modelo no alcanza el umbral de calidad requerido. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- **Inferencia en CPU**: el entrenamiento se realizó en una CPU Intel i5-1135G7 con 8 GB RAM, por lo que la inferencia es viable en hardware de bajo consumo. La latencia medida es de ~7746 ms por muestra en ese entorno.
- **GPU recomendadas**: no se especifica, pero al ser un modelo de 0.8B, cabe en cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060). En la práctica, se puede ejecutar en CPU.
- **Opciones de despliegue**: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en Python. No se ha probado con vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: la model card reporta 7745.8 ms/muestra en CPU, pero no se ofrecen datos para GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Este adaptador (r=16)** | LoRA sobre Qwen3.5-0.8B | No disponible | No disponible | target 0.360, regression 0.644 | Apache-2.0 | HuggingFace |
| **Adaptador LoRA r=64** (mismo base, mismo entrenamiento) | LoRA sobre Qwen3.5-0.8B | No disponible | No disponible | target 0.520, regression 0.067 | Apache-2.0 | No publicado (reportado en la model card) |
| **Base Qwen3.5-0.8B + prompt optimizado** | Transformer multimodal híbrido | 0.8B | No disponible | target 0.495, regression 0.556 | Apache-2.0 | HuggingFace |

El adaptador r=64 supera al adaptador r=16 en target, pero sufre una regresión catastrófica en capacidades generales. El base model con prompt optimizado sigue siendo mejor opción para la tarea de clasificación, ya que no requiere entrenamiento adicional y obtiene un target superior.

## Limitaciones y advertencias

- **Calidad insuficiente**: el adaptador no supera el base model con prompt optimizado, por lo que su uso en producción no está justificado.
- **Alucinación de etiquetas**: genera valores enum que no existen en el espacio de etiquetas (p. ej., `thong_tinh`, `tich_tich`), lo que puede causar errores si no se valida la salida.
- **Confusión de campos**: a veces rellena `urgency` con valores de `sentiment` (p. ej., `trung_tinh`).
- **Corte de nombres de producto**: puede truncar nombres de productos (p. ej., `balo laptop` → `laptop`).
- **Datos sintéticos**: el entrenamiento usa tickets generados por script, no tickets reales; la diversidad lingüística es limitada.
- **Dominio restringido**: solo funciona para comercio electrónico en vietnamita.
- **Evaluación limitada**: la evaluación se realizó en solo 50 muestras; diferencias menores de ~0.05 pueden ser ruido.
- **Sin pruebas de seguridad**: no se evaluaron sesgos, datos personales ni riesgos de seguridad. Los tickets reales suelen contener información personal (nombres, teléfonos, direcciones).
- **Requisito de prompt**: el sistema prompt debe ser exactamente `"Phân loại ticket sau."` (en vietnamita); cambiar el prompt durante la inferencia provoca fallos (0.000 en target).

## Enlaces

- [HuggingFace - tiandao1707/qwen3.5-0.8b-vi-ticket-triage-lora](https://huggingface.co/tiandao1707/qwen3.5-0.8b-vi-ticket-triage-lora)
- [GitHub del autor - código y reporte](https://github.com/leduc1707/K3-Track03-Lab21-2A202601767-LeQuangDuc)
- [Modelo base Qwen3.5-0.8B en HuggingFace](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Documentación de Qwen3.5 en Unsloth](https://unsloth.ai/docs/models/qwen3.5/fine-tune)
- [Qwen3.5 en Ollama](https://ollama.com/library/qwen3.5:0.8b)
- [Qwen3.5 en Roboflow](https://inference-models.roboflow.com/models/qwen35/)
