# Vantuk/model_set_v75

## Resumen

`Vantuk/model_set_v75` es un conjunto de modelos empaquetados para construir un pipeline completo de traducción de voz a voz (speech-to-speech) que se ejecuta íntegramente en un dispositivo móvil, sin depender de la nube. Lo publica el usuario Vantuk bajo licencia Apache 2.0 y está orientado a hardware Qualcomm Snapdragon 8650 (SM8650), aprovechando la NPU Hexagon a través del backend QNN HTP v75. El paquete incluye detección de idioma hablado, reconocimiento automático del habla en vietnamita, inglés y coreano, un modelo de traducción en formato GGUF y varios modelos de síntesis de voz basados en Piper.

El componente central de traducción es `Hy-MT2-1.8B-Q4_0-enviko32k`, un modelo de 1.601.173.504 parámetros (según los safetensors del repo) cuantizado a Q4_0 y ejecutado con `llama.cpp` sobre CPU Arm con extensiones KleidiAI (`+dotprod+i8mm`). El resto de etapas son modelos más pequeños especializados: ECAPA para identificación de idioma, Gipformer y SenseVoice para ASR, y Piper para TTS, todos ellos en formatos ONNX/GGUF optimizados para inferencia local.

La relevancia de este paquete es su enfoque en despliegue real en dispositivo: combina NPU, CPU y formatos ligeros para ofrecer un pipeline multietapa funcional en un teléfono de gama alta, algo poco habitual en un único repositorio. La información pública disponible es escasa (0 descargas, 0 likes, sin benchmarks), por lo que muchos detalles técnicos deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de traducción Hy-MT2-1.8B); pipeline con ECAPA-LID, Gipformer, SenseVoice y Piper TTS |
| Parámetros totales | 1.601.173.504 (modelo de traducción) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_0 (modelo de traducción); INT8 (ASR Gipformer y SenseVoice); formatos ONNX para LID y TTS |
| Idiomas soportados | Vietnamita, inglés y coreano (ASR y TTS); traducción EN/VI/KO según el nombre del checkpoint |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (traducción), ONNX (ASR, LID, TTS), safetensors (repo) |

## Arquitectura y entrenamiento

El paquete no es un único modelo monolítico, sino un conjunto de etapas encadenadas. La etapa de traducción emplea `Hy-MT2-1.8B`, un transformer de 1.8B parámetros cuantizado a Q4_0 en formato GGUF, pensado para ejecutarse con `llama.cpp` sobre CPU Arm. Las etapas de reconocimiento del habla usan Gipformer (vietnamita) y SenseVoice (inglés y coreano) en INT8 sobre Sherpa-ONNX, mientras que la identificación de idioma hablado se resuelve con un modelo ECAPA-LID ejecutado en la NPU QNN HTP v75. La síntesis de voz se reparte entre Piper (coreano KSS, vietnamita VAIS-1000 e inglés Lessac) con un esquema híbrido que descarga parte del cómputo en la NPU y deja el resto en CPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en ninguna de las etapas. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. Lo que sí es explícito es la optimización para hardware: uso de KleidiAI en CPU Arm, backend QNN HTP v75 para NPU y formatos ONNX/GGUF para minimizar el peso en memoria.

## Capacidades

- Traducción de voz a voz entre vietnamita, inglés y coreano dentro del pipeline descrito.
- Detección de idioma hablado (spoken LID) mediante ECAPA-LID sobre NPU.
- Reconocimiento automático del habla en vietnamita (Gipformer INT8), inglés y coreano (SenseVoice INT8), y ASR en streaming para coreano.
- Evaluación de "source readiness" (preparación de la fuente) sobre NPU QNN HTP v75.
- Síntesis de voz con Piper para coreano, vietnamita e inglés, con G2P mediante eSpeak-NG para inglés y vietnamita.
- Ejecución on-device: no requiere conexión a la nube ni GPU dedicada.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`), lo que sugiere integración con infraestructura de inferencia estándar.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Traducción presencial en dispositivos móviles: el pipeline captura voz, detecta el idioma, transcribe, traduce y sintetiza en el mismo dispositivo, útil para viajeros o atención en mostrador sin conectividad.
- Aplicaciones de accesibilidad para personas con discapacidad auditiva o del habla: la combinación ASR + traducción + TTS permite convertir voz en texto traducido y de vuelta a voz sintética.
- Asistentes de voz offline en entornos con red restringida: fábricas, hospitales o zonas rurales donde no se puede depender de APIs en la nube.
- Prototipado de pipelines speech-to-speech en investigación: el repositorio ofrece todas las etapas etiquetadas y con rutas claras, lo que facilita sustituir componentes individuales (por ejemplo, cambiar el modelo de traducción GGUF).
- Integración en dispositivos Snapdragon 8650: al estar optimizado para QNN HTP v75, encaja en teléfonos y placas de desarrollo con esa plataforma, reduciendo el consumo energético frente a soluciones puramente en CPU.
- Evaluación comparativa de ASR ligero: los modelos Gipformer y SenseVoice en INT8 permiten medir latencia y precisión en CPU sin infraestructura GPU.
- Demos de TTS multilingüe con Piper: útil para generar voces sintéticas en coreano, vietnamita e inglés en aplicaciones de lectura o navegación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para el pipeline principal, diseñado para ejecución en dispositivo (NPU + CPU). El modelo de traducción de 1.8B en Q4_0 ocupa aproximadamente 1 GB de pesos, aunque el requisito exacto de memoria no está especificado.
- GPU recomendadas: no disponibles; el paquete está orientado a Qualcomm QNN HTP v75 (NPU) y CPU Arm, no a GPU discretas.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no indicada; el diseño es para móvil y hardware embebido.
- Opciones de despliegue: `llama.cpp` para el modelo GGUF, Sherpa-ONNX para ASR, QNN HTP v75 para LID y etapas de readiness, y Piper para TTS con eSpeak-NG como G2P.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (pipeline speech-to-speech on-device empaquetado) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Información pública muy limitada: 0 descargas, 0 likes y sin benchmarks publicados, lo que impide validar la calidad del pipeline.
- Cobertura lingüística restringida a vietnamita, inglés y coreano; no hay evidencia de soporte para castellano ni otros idiomas.
- Dependencia de hardware Qualcomm QNN HTP v75 para varias etapas (LID, readiness, parte del TTS); en otros dispositivos habrá que usar fallbacks en CPU, con posible pérdida de rendimiento.
- Riesgo de alucinación y errores de traducción inherente a un modelo de 1.8B cuantizado a Q4_0; la cuantización agresiva puede degradar la calidad frente al modelo original.
- El ASR en vietnamita (Gipformer) y el coreano en streaming pueden tener coberturas y precisiones distintas a las de SenseVoice; no se documentan métricas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los componentes de terceros (Piper, eSpeak-NG, SenseVoice, Gipformer) antes de producción.
- No se especifican sesgos conocidos ni limitaciones de contexto; ante la ausencia de documentación, se recomienda evaluar empíricamente antes de desplegar.
- El repositorio tiene 388 archivos y 1.877 GB; la gestión de versiones y la integridad de los artefactos ONNX/GGUF deben validarse en el entorno de destino.

## Enlaces

- [Hugging Face: Vantuk/model_set_v75](https://huggingface.co/Vantuk/model_set_v75)
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información proporcionada.
