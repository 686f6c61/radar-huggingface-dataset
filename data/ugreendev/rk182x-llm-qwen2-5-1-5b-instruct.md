# UGREENDEV/RK182X-LLM-Qwen2.5-1.5B-Instruct

## Resumen

RK182X-LLM-Qwen2.5-1.5B-Instruct es una conversión al formato RKNN del modelo Qwen/Qwen2.5-1.5B-Instruct, publicada por UGREENDEV para su ejecución sobre las NPU Rockchip RK1820 y RK1828. No se trata de un modelo entrenado desde cero, sino de un derivado cuantizado y compilado específicamente para el runtime RKNN v1.1.0, orientado a inferencia en dispositivos embebidos y de borde con aceleración NPU.

El modelo base, Qwen2.5-1.5B-Instruct, es un transformer decoder-only de aproximadamente 1.540 millones de parámetros, ajustado por instrucciones, desarrollado por el equipo Qwen de Alibaba. Esta conversión conserva la licencia Apache 2.0 del original y se distribuye con una única configuración: cuantización de pesos w4a16 (pesos de 4 bits, activaciones de 16 bits) sobre 8 núcleos NPU, con una longitud de contexto de 10.752 tokens y caché KV en fp16.

Su relevancia es acotada pero específica: permite desplegar un LLM conversacional de 1,5B parámetros en hardware Rockchip de la familia RK182X sin necesidad de GPU dedicada, lo que facilita casos de uso de IA local en dispositivos empotrados. El repositorio ocupa 1,5 GB e incluye ficheros de verificación SHA-256, lo que resulta útil para pipelines de despliegue reproducibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5); empaquetado como RKNN para NPU Rockchip |
| Parametros totales | Aproximadamente 1.540 millones (1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 10.752 tokens (10,5k) en la configuración publicada |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); caché KV en fp16 |
| Idiomas soportados | No disponible en la información proporcionada (heredados del modelo base Qwen2.5) |
| Licencia | Apache 2.0 (modelo base); aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); el repositorio también se etiqueta como gguf, aunque los artefactos principales son RKNN |
| Chips soportados | RK1820, RK1828 |
| Nucleos NPU | 8 |
| Version de runtime | RKNN Runtime v1.1.0 |
| Tamano del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención completa estándar, sin mecanismos MoE ni híbridos SSM. Esta publicación no aporta información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, etapas de RLHF o DPO), por lo que esos datos deben consultarse en la model card original de Qwen. La innovación técnica de esta versión no reside en el entrenamiento, sino en la conversión: el modelo se compila al formato RKNN con cuantización w4a16 y se distribuye con una configuración fija optimizada para 8 núcleos NPU, caché KV en fp16 y una ventana de contexto de 10.752 tokens.

El repositorio incluye sumas de verificación SHA-256 por configuración, lo que permite validar la integridad de los artefactos antes del despliegue. La conversión mantiene la relación `base_model_relation: quantized` respecto a Qwen2.5-1.5B-Instruct y conserva los avisos de atribución y licencia del modelo original en el fichero `Notice`.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste por instrucciones de Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones en formato chat.
- Generación de código y tareas sencillas de matemáticas, dentro de los límites de un modelo de 1,5B parámetros.
- Ejecución sobre NPU Rockchip RK1820 y RK1828 mediante RKNN Runtime v1.1.0.
- Contexto de hasta 10.752 tokens con caché KV en fp16.
- Soporte multilingüe: no disponible en la información proporcionada para esta conversión.
- Tool calling, function calling y modo thinking: no disponibles en la información proporcionada para esta conversión.

## Casos de uso

- Asistentes conversacionales en dispositivos empotrados: el modelo puede gestionar diálogos multi-turno con hasta 10.752 tokens de contexto ejecutándose íntegramente en la NPU de un SoC RK1820 o RK1828, sin GPU externa ni conexión a la nube.
- Procesamiento de lenguaje natural en el borde (edge NLP): clasificación, resumen y extracción de información sobre texto capturado por sensores o interfaces locales, aprovechando la cuantización w4a16 para reducir el consumo de memoria.
- Interfaces de voz o texto en electrodomésticos y equipos industriales: al caber en hardware Rockchip, permite integrar un asistente de instrucciones en paneles de control, kioscos o terminales de campo.
- Prototipado rápido de aplicaciones LLM sobre RK182X: el repositorio incluye checksums SHA-256 y una configuración única documentada, lo que simplifica la validación y el despliegue reproducible en laboratorio.
- Filtrado y moderación de contenido local: tareas de clasificación y reescritura de texto que se benefician de ejecutarse on-device por privacidad, sin enviar datos a servidores externos.
- Educación y demos de IA local: un modelo de 1,5B en formato RKNN es adecuado para talleres y demostraciones de inferencia NPU en placas Rockchip, con un peso de repositorio de 1,5 GB fácil de distribuir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta sobre NPU Rockchip, no sobre GPU. El repositorio ocupa 1,5 GB y la cuantización w4a16 reduce la huella de pesos respecto al modelo en fp16.
- Chips soportados: RK1820 y RK1828 exclusivamente. No es ejecutable en GPU convencionales ni en CPU genérica a través de este paquete.
- Runtime: RKNN Runtime v1.1.0 con el driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Cabe en GPU de consumo: no aplica; el artefacto está compilado para NPU Rockchip y no es portable a CUDA.
- Opciones de despliegue: RKNN Runtime sobre RK1820/RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-LLM-Qwen2.5-1.5B-Instruct (esta ficha) | ~1,5B | 10.752 tokens | RKNN, NPU RK1820/RK1828 | Apache 2.0 | Hugging Face y ModelScope |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,54B | No disponible en la información proporcionada | Safetensors, GPU/CPU | Apache 2.0 | Hugging Face |
| Modelos GGUF de Qwen2.5-1.5B-Instruct | ~1,5B | No disponible en la información proporcionada | GGUF, llama.cpp en CPU/GPU | Apache 2.0 | Hugging Face |

La diferencia principal frente a las alternativas es el backend de ejecución: esta versión solo funciona en NPU Rockchip RK182X, mientras que el modelo original y sus cuantizaciones GGUF se ejecutan en GPU o CPU convencionales. En parámetros y licencia son equivalentes; el contexto de 10.752 tokens es específico de esta configuración.

## Limitaciones y advertencias

- El modelo solo es compatible con los chips RK1820 y RK1828; no se puede ejecutar en GPU NVIDIA, AMD ni en CPU genérica a través de este paquete.
- Requiere la versión exacta de RKNN Runtime (v1.1.0) y el driver correspondiente; una discrepancia de versión puede impedir la ejecución.
- Los ficheros de una configuración deben usarse conjuntamente; mezclar artefactos de distintas configuraciones no está soportado.
- Al ser un derivado cuantizado a w4a16, es previsible una degradación de calidad respecto al modelo base en fp16, aunque no se han publicado métricas que la cuantifiquen.
- Riesgo de alucinación inherente a un modelo de 1,5B parámetros ajustado por instrucciones; no se han publicado evaluaciones específicas de esta conversión.
- Sesgos conocidos: no disponibles en la información proporcionada para esta conversión; deben evaluarse los del modelo base Qwen2.5-1.5B-Instruct.
- Idiomas soportados: no disponibles en la información proporcionada; conviene verificar el comportamiento multilingüe antes de usarlo en producción.
- Licencia Apache 2.0 para el modelo base, pero se aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime, que deben revisarse para uso comercial.
- El repositorio se actualizó por última vez el 20 de noviembre de 2026 y no registra descargas ni likes, por lo que no hay validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-Qwen2.5-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentación de Qwen2.5-1.5B-Instruct en M5Stack: https://docs.m5stack.com/en/stackflow/models/qwen2.5-1.5b-instruct
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-LLM-Qwen2.5-1.5B-Instruct --revision master`
