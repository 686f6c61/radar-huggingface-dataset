# younghan-meta/Supertonic-ExecuTorch-MLX

## Resumen

El repositorio `younghan-meta/Supertonic-ExecuTorch-MLX` contiene una exportación lista para ejecutar del modelo de síntesis de voz Supertonic 3, preparada específicamente para Macs con Apple Silicon mediante el backend ExecuTorch MLX. El artefacto principal es un archivo `model.pte` de 198 MB que encapsula el modelo completo en formato ExecuTorch PTE, lo que permite ejecutar síntesis de texto a voz de forma local y sin conexión en hardware de Apple.

Supertonic 3 es un modelo de texto a voz (TTS) de código abierto con 99 millones de parámetros, diseñado para ejecutarse en CPU y GPU locales, con soporte para 31 idiomas. La conversión a ExecuTorch MLX no modifica los pesos ni realiza reentrenamiento; simplemente cambia la serialización y el formato de ejecución para aprovechar las GPU de Apple Silicon a través de Metal. Esta exportación es relevante porque facilita el despliegue de TTS multilingüe de alta calidad en dispositivos Apple sin depender de servicios en la nube ni de GPUs dedicadas.

El repositorio incluye metadatos de procedencia (SHA-256, revisiones de origen) y un manifiesto JSON para verificación de integridad. No redistribuye el ejecutable nativo `supertonic_runner`, la biblioteca Metal, ni los recursos de configuración y voces del modelo original, por lo que el usuario debe obtenerlos por separado desde las fuentes oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS, detalles no publicados en el repositorio) |
| Parametros totales | 99 millones (según la web oficial de Supertonic 3) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (no aplica directamente a TTS) |
| Tipos de cuantizacion | FP16 (según el ejemplo de ExecuTorch) |
| Idiomas soportados | 31 idiomas (según la web oficial de Supertonic 3) |
| Licencia | BigScience Open RAIL-M |
| Formato de pesos | ExecuTorch PTE (model.pte) |

## Arquitectura y entrenamiento

La arquitectura interna de Supertonic 3 no se detalla en la información proporcionada. Se sabe que es un modelo de síntesis de voz con 99 millones de parámetros, optimizado para ejecución en dispositivos locales. El export a ExecuTorch MLX convierte el modelo original en un programa ExecuTorch dinámico FP16 que delega las operaciones a la GPU de Apple Silicon a través del backend MLX. Este proceso no implica reentrenamiento ni ajuste fino; solo cambia el formato de serialización y el runtime de ejecución.

Los datos de entrenamiento y el proceso de entrenamiento (si se usó RLHF, DPO, etc.) no están disponibles en el repositorio. La web oficial de Supertonic 3 menciona que es un modelo de pesos abiertos, pero no se proporcionan detalles adicionales sobre el dataset o las técnicas de entrenamiento.

## Capacidades

- Síntesis de texto a voz (TTS) de una sola pasada (one-shot) con calidad de voz natural.
- Soporte multilingüe: 31 idiomas (según la web oficial).
- Ejecución totalmente local en Apple Silicon (macOS arm64) mediante MLX, sin necesidad de GPU dedicada ni conexión a internet.
- Generación de audio PCM mono de 16 bits (formato de salida del runner).
- Compatible con el ecosistema ExecuTorch: permite integración en aplicaciones PyTorch y flujos de trabajo de despliegue en dispositivos.
- No incluye capacidades de visión, razonamiento o generación de texto; es un modelo especializado exclusivamente en TTS.

## Casos de uso

- Asistentes de voz en macOS: integrar el modelo en aplicaciones nativas de escritorio para leer en voz alta notificaciones, documentos o correos electrónicos, aprovechando la baja latencia de la GPU Apple Silicon.
- Lectura de pantalla y accesibilidad: generar audio a partir de texto en tiempo real para personas con discapacidad visual, con soporte multilingüe y sin depender de servicios externos.
- Aplicaciones de aprendizaje de idiomas: producir pronunciación natural en 31 idiomas para ejercicios de escucha y repetición, ejecutándose completamente en el dispositivo del usuario.
- Generación de audiolibros y podcasts: convertir texto largo en voz con calidad aceptable, usando el modelo en un Mac local para procesar grandes volúmenes de contenido.
- Prototipado de asistentes de voz: servir como componente TTS en prototipos de agentes conversacionales, con ejecución local que elimina costes de API y latencia de red.
- Automatización de documentación técnica: leer en voz alta manuales, tutoriales o descripciones de productos en entornos de desarrollo, donde el modelo puede invocarse desde scripts o herramientas de línea de comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La web oficial de Supertonic 3 menciona "lightning-fast" y "on-device", pero no se proporcionan métricas numéricas de latencia, throughput ni calidad de voz (como MOS). Tampoco hay comparaciones con otros modelos TTS en el repositorio.

## Requisitos de hardware

- Plataforma: macOS con chip Apple Silicon (arm64), incluyendo M1, M2, M3 y sus variantes Pro/Max/Ultra.
- Memoria: el archivo PTE ocupa 198 MB, por lo que se recomienda al menos 1 GB de RAM libre para cargar el modelo y el runtime. La memoria total del Mac debe ser suficiente para la aplicación anfitriona.
- GPU: se utiliza la GPU integrada del chip Apple Silicon a través de Metal (vía MLX). No se requiere GPU externa.
- CPU: funciona también en CPU, pero el rendimiento será menor que con la GPU.
- Opciones de despliegue: se requiere el runtime ExecuTorch y el ejecutable nativo `supertonic_runner` (no incluido en el repositorio). El ejemplo oficial de ExecuTorch (`executorch/examples/models/supertonic`) proporciona el flujo de exportación y ejecución.
- Latencia y throughput: no disponibles. Se espera baja latencia para síntesis de una sola frase, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables con otros modelos TTS open-source (como Coqui TTS, Piper, XTTS) en términos de calidad, velocidad o uso de recursos. La información proporcionada no incluye benchmarks comparativos. Se recomienda consultar la web oficial de Supertonic 3 para posibles comparaciones, aunque no se han encontrado en la búsqueda.

## Limitaciones y advertencias

- Licencia BigScience Open RAIL-M: incluye restricciones de uso basadas en la licencia (Attachment A), que pueden limitar aplicaciones comerciales o usos específicos. Es obligatorio leer el archivo `LICENSE` antes de usar o redistribuir el modelo.
- El repositorio no redistribuye los recursos necesarios para la síntesis (configuración, text-processing, voces). El usuario debe obtenerlos del repositorio original de Supertonic y compilar el runner nativo, lo que añade complejidad al despliegue.
- Al ser un modelo TTS, puede presentar sesgos en la pronunciación de nombres propios, acentos regionales o palabras poco comunes, especialmente en idiomas con pocos datos de entrenamiento.
- Riesgo de alucinación auditiva: el modelo podría generar sonidos o entonaciones inesperadas en entradas de texto ambiguas o mal formateadas.
- La exportación está fijada a una revisión concreta del modelo fuente (`3cadd1ee6394adea1bd021217a0e650ede09a323`); actualizaciones posteriores de Supertonic 3 no estarán reflejadas hasta que se genere una nueva exportación.
- El formato PTE es específico de ExecuTorch y no es directamente compatible con otros frameworks de inferencia (PyTorch, ONNX, etc.).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/younghan-meta/Supertonic-ExecuTorch-MLX
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Ejemplo oficial de ExecuTorch para Supertonic: https://github.com/pytorch/executorch/tree/main/examples/models/supertonic
- README del ejemplo en GitHub: https://github.com/pytorch/executorch/blob/main/examples/models/supertonic/README.md
- Web oficial de Supertonic 3: https://supertonic3.github.io/
- Blog de PyTorch sobre el backend MLX: https://pytorch.org/blog/running-pytorch-models-on-apple-silicon-gpus-with-the-executorch-mlx-delegate/
