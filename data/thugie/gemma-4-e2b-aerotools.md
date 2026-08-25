# ThuGie/gemma-4-E2B-aerotools

## Resumen

El modelo **ThuGie/gemma-4-E2B-aerotools** es un fine-tune mediante QLoRA del modelo base `google/gemma-4-E2B-it`, desarrollado por el autor ThuGie. Su propósito es especializar el modelo en la generación fiable de comandos JSON para el protocolo de control de vuelo de drones AeroSentinel, a partir de instrucciones en lenguaje natural en inglés y neerlandés. El modelo está optimizado para su despliegue en dispositivos móviles mediante LiteRT-LM, con versiones específicas para GPU/CPU y para el NPU del Snapdragon 8 Elite (SM8750).

La relevancia de este modelo radica en que aborda un problema concreto de producción: el modelo base Gemma 4 E2B-it, al ejecutar el protocolo JSON de la aplicación, producía errores sistemáticos como claves con guiones bajos colapsados, inversiones de signo en coordenadas, confusiones entre centímetros y metros, y desviaciones del formato en conversaciones largas. Este fine-tune corrige esas deficiencias en la fuente, en lugar de depender de parches posteriores. El modelo final tiene un tamaño de 5,3 GB en el repositorio, con artefactos `.litertlm` de aproximadamente 2,4-2,5 GB cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B-it) con adaptador LoRA (QLoRA 4-bit) |
| Parametros totales | 5,15 B (modelo base) + adaptador LoRA (r=16) |
| Parametros activos | ~2 B efectivos (PLE, según el autor) |
| Longitud de contexto | 8K tokens (según gemma4.dev para Gemma 4 E2B) |
| Tipos de cuantizacion | int4 pesos / int8 selectivo (receta `gemma4_mixed48`), también safetensors para el adaptador |
| Idiomas soportados | Ingles (en), neerlandes (nl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA), `.litertlm` (modelo convertido para LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B-it, un transformer de 5,15 B parámetros totales con aproximadamente 2 B efectivos (PLE, posiblemente una arquitectura con parámetros compartidos o eficiencia a nivel de parámetros, aunque el autor no detalla el mecanismo). Sobre este base se aplicó un adaptador LoRA con r=16 y α=16, entrenado con QLoRA en 4 bits mediante Unsloth FastModel, afectando a las capas de atención y MLP.

El entrenamiento utilizó 6.659 ejemplos validados generados por síntesis a partir del protocolo, con 205 ejemplos de evaluación retenidos. Se entrenó durante 2 épocas con una secuencia de 1152 tokens, batch efectivo de 16, tasa de aprendizaje 2e-4 con programación coseno y optimizador AdamW de 8 bits. La pérdida final fue de 0,227 en entrenamiento y 0,141 en evaluación, sin signos de sobreajuste. La pérdida se calculó solo sobre los tokens de respuesta del asistente (`train_on_responses_only`). El hardware de entrenamiento fue una RTX 2080 Ti de 11 GB, con cómputo fp32 (Turing), y el proceso duró aproximadamente 6 horas y 20 minutos.

## Capacidades

- Generacion de comandos JSON exactos para el protocolo AeroSentinel, con una única salida JSON minificada por instrucción.
- Soporte de 18 acciones de vuelo: `TAKEOFF`, `LAND`, `RTH`, `STOP`, `HOLD`, `MOVE_RELATIVE`, `SPEED_UP`, `SLOW_DOWN`, `SET_SPEED`, `FOLLOW`, `ORBIT`, `EXPLORE`, `FACE_TARGET`, `TRACK_TARGET`, `CINEMATIC_*`, `GO_TO`, `WAYPOINT`, `CHAT`.
- Conversión de unidades de medida (mm, cm, m) y de números en palabras neerlandesas (p. ej., "anderhalf" → 1,5).
- Semántica de signos correcta: "links/left" → `right_m` negativo, "achteruit/back" → `forward_m` negativo, "omlaag/down" → `altitude_m` negativo.
- Manejo de acciones multi-eje y secuencias de ascenso con `movement_order`.
- Rechazos fundamentados mediante `{"action":"CHAT"}` cuando la solicitud excede los límites operativos (p. ej., altitud relativa > ±30 m).
- Robustez ante ruido de ASR, incluyendo homófonos neerlandeses como "ij/ei".
- Generación de respuestas lúdicas en el idioma del piloto, con máximo 8 palabras.
- Despliegue en dispositivos móviles con NPU Qualcomm (Snapdragon 8 Elite) mediante LiteRT-LM.

## Casos de uso

- **Control de drones por voz en campo**: un piloto puede dar instrucciones habladas en inglés o neerlandés ("opstijgen", "vlieg drie meter naar links") y el modelo genera el comando JSON exacto para el autopiloto, con conversión de unidades y signos correctos.
- **Asistente de vuelo en aplicaciones móviles**: integración en una app de control de drones para Android, usando el artefacto `.litertlm` con NPU, lo que permite inferencia local sin conexión y baja latencia en un Galaxy S25 Ultra.
- **Sistema de respuesta a emergencias**: el modelo puede interpretar órdenes de aterrizaje o retorno a base (RTH) de forma fiable, incluso con ruido de fondo o acentos, gracias a su robustez ante errores de ASR.
- **Automatización de misiones de inspección**: comandos como `ORBIT` o `WAYPOINT` se generan con precisión para misiones predefinidas, reduciendo la intervención manual del operador.
- **Entrenamiento de pilotos**: simulación de conversaciones con el modelo para practicar comandos de vuelo, validando que las respuestas JSON cumplen el protocolo.
- **Pruebas de integración de software**: el modelo puede usarse en pipelines de CI/CD para generar comandos de prueba del protocolo AeroSentinel, verificando la compatibilidad del backend con el formato JSON esperado.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación sobre 205 ejemplos retenidos, que incluyen ruido ASR neerlandés, conversiones de unidades y rechazos por límites:

| Metrica | Resultado |
|---|---|
| Coincidencia estricta (accion + todos los parametros) | 94,1% (193/205) |
| JSON valido y unico minificado | 100% (0 no parseables) |
| Precision a nivel de accion | 97,1% (199/205) |
| MOVE_RELATIVE (signos, cm/m, numeros neerlandeses) | 65/65 |
| TAKEOFF / HOLD / LAND / EXPLORE / FOLLOW / GO_TO | perfecto |

Puntos debiles conocidos: confusion entre `TRACK_TARGET` y `FOLLOW` en frases casi duplicadas (5 casos), 3 errores en radio/velocidad de `ORBIT`, y 3 `WAYPOINT` truncados en misiones largas con multiples tramos.

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- **Inferencia en dispositivo movil**: el artefacto `.litertlm` cuantizado pesa 2,4 GB (GPU/CPU) o 2,5 GB (NPU Qualcomm SM8750). Requiere un dispositivo con Qualcomm AI Runtime 2.47.x para la version NPU.
- **GPU de escritorio**: el modelo base con adaptador LoRA puede ejecutarse en GPUs con al menos 8 GB de VRAM en cuantizacion 4-bit (el entrenamiento se hizo en una RTX 2080 Ti de 11 GB). Para el modelo completo en precision float, se necesitarian ~10 GB.
- **Opciones de despliegue**: LiteRT-LM (`litert-lm run`), tambien compatible con frameworks que soporten safetensors y LoRA (p. ej., Hugging Face Transformers con PEFT).
- **Latencia**: no se proporcionan datos de latencia, pero al estar optimizado para NPU movil se espera inferencia en tiempo real para comandos cortos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| ThuGie/gemma-4-E2B-aerotools | 5,15 B total / ~2 B efectivos | 8K | Tool-calling para drones (protocolo AeroSentinel) | Apache 2.0 |
| google/gemma-4-E2B-it (base) | 5,15 B total / ~2 B efectivos | 8K | Asistente general, tool-calling generico | Apache 2.0 |
| Llama 3.2 1B (hipotetico comparable) | 1 B | 128K | Asistente general | Llama 3.2 Community License |

No se dispone de datos de rendimiento comparativo entre estos modelos en la tarea especifica de tool-calling para drones. La comparativa se limita a caracteristicas generales.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para el protocolo JSON de AeroSentinel; no funciona como asistente general de proposito general.
- Los deltas de altitud relativa estan limitados a ±30 m por diseño del codificador de la aplicacion; solicitudes fuera de ese rango se rechazan.
- El artefacto PTQ (2,4 GB) es ligeramente mas pequeno que la compilacion QAT oficial de Google (2,58 GB), por lo que puede haber una pequena perdida de calidad respecto a QAT.
- La version NPU esta compilada con QAIRT 2.47.0 y los binarios de contexto estan bloqueados a esa version; el runtime de la aplicacion debe mantenerse en 2.47.x para evitar incompatibilidades.
- El modelo puede confundir `TRACK_TARGET` con `FOLLOW` en frases muy similares, y puede truncar `WAYPOINT` en misiones largas.
- No se han evaluado sesgos de genero, raza u otros; el entrenamiento se centro en datos sinteticos del protocolo, por lo que no se puede garantizar ausencia de sesgos en respuestas `CHAT`.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 tiene sus propias condiciones; se recomienda revisar la licencia de Google para Gemma 4.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ThuGie/gemma-4-E2B-aerotools
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-E2B
- Pagina oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Analisis tecnico de Gemma 4 (Qubrid): https://www.qubrid.com/blog/google-gemma-4-technical-deep-dive-architecture-moe-benchmarks-production-guide
- Ficha de Gemma 4 E2B en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
