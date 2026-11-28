# Xylolabs/FRCRN_SE_16K-Tenstorrent-Tensix-BF16

## Resumen

FRCRN_SE_16K-Tenstorrent-Tensix-BF16 es una conversión de pesos del modelo de mejora de voz FRCRN (alibabasglab/FRCRN_SE_16K) empaquetada en bfloat16 para su ejecución sobre NPUs Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante la pila TTNN. Lo publica Xylolabs y no introduce un modelo nuevo: traslada un checkpoint de supresión de ruido ya existente a un formato y precisión adecuados para aceleradores Tenstorrent, manteniendo la referencia al modelo base original.

El modelo resuelve la tarea de speech enhancement: recibe un espectro complejo normalizado de una señal de audio a 16 kHz y devuelve una máscara compleja que, aplicada al espectro de entrada, atenúa el ruido de fondo. La arquitectura subyacente es FRCRN (red convolucional recurrente con atención frecuencial), con 23.760.720 parámetros. El checkpoint publicado contiene únicamente los pesos en BF16 (0,05 GB); el pipeline de enmarcado, normalización, aplicación de máscara y síntesis debe aportarlo la implementación consumidora.

La relevancia de esta ficha radica en su carácter de artefacto de despliegue: no es un modelo de lenguaje ni un transformer generativo, sino un componente de procesamiento de audio optimizado para hardware específico. Es útil para equipos que ya trabajan con NPUs Tenstorrent y necesitan integrar supresión de ruido en pipelines de audio en tiempo real, y menos relevante para quien busque un modelo autónomo listo para usar con bibliotecas estándar de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FRCRN (red convolucional recurrente con atención frecuencial) |
| Parametros totales | 23.760.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa espectros de 640 puntos FFT con hop de 320 muestras) |
| Tipos de cuantizacion | BF16 (unico formato publicado) |
| Idiomas soportados | no disponible (procesamiento de audio, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, carpeta `bf16/`) |

## Arquitectura y entrenamiento

El modelo base FRCRN combina capas convolucionales con componentes recurrentes y un mecanismo de atención frecuencial, orientado a la estimación de máscaras espectrales para supresión de ruido. La entrada es un espectro complejo normalizado con forma `[1, 2, 321, 51]` para audio a 16 kHz, FFT de 640 puntos y hop de 320 muestras; la salida es la máscara compleja `tanh(u1) + tanh(u2)` en el mismo formato real/imaginario. La conversión de Xylolabs pliega los pesos y los almacena en BF16 para ejecución sobre Tensix; no se documentan en la información disponible detalles sobre el dataset de entrenamiento original, el número de tokens o muestras, ni si hubo etapas de ajuste fino adicionales.

La innovación técnica de esta release es de despliegue, no de modelado: adapta un checkpoint de PyTorch a la pila TTNN de Tenstorrent y verifica la equivalencia numérica frente al modelo original en CPU. Según la model card, la comparación de SNR de máscara/espectro mejorado arroja 27,87/39,12 dB en espectros normalizados reservados y 17,46/17,66 dB en espectros sintéticos.

## Capacidades

- Supresión de ruido y mejora de voz sobre audio a 16 kHz mediante estimación de máscara espectral compleja.
- Procesamiento de espectros complejos normalizados con FFT de 640 puntos y hop de 320 muestras.
- Ejecución sobre NPUs Tenstorrent Tensix (Wormhole, Blackhole) a través de TTNN.
- Carga de pesos individuales con `safetensors` para inspección o integración manual.
- No incluye generación de texto, razonamiento, código, matemáticas ni visión.
- No dispone de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio-to-text, etc.).

## Casos de uso

- Preprocesado de voz en pipelines de ASR: aplicar la máscara estimada antes de alimentar un reconocedor de voz para reducir falsos negativos en entornos ruidosos, aprovechando la ventana espectral de 321 bins y el hop de 320 muestras.
- Videoconferencia y VoIP en dispositivos con acelerador Tenstorrent: integrar el modelo en la cadena de captura de micrófono para atenuar ruido de fondo en tiempo real, dado su tamaño reducido (23,7 M de parámetros, 0,05 GB en BF16).
- Limpieza de grabaciones de campo: procesar audio a 16 kHz de entrevistas o notas de voz para mejorar la inteligibilidad antes de transcripción o archivado.
- Telefonía y centros de atención: mejorar la señal de llamadas antes del análisis de sentimiento o de la transcripción automática, reduciendo el ruido ambiental del interlocutor.
- Investigación en hardware Tenstorrent: usar el checkpoint como referencia para validar conversiones TTNN, comparando la SNR reportada frente a la implementación en CPU.
- Evaluación de robustez de modelos de voz: emplear la máscara como etapa de aumento o limpieza en experimentos controlados sobre espectros sintéticos, donde la model card reporta 17,46/17,66 dB de SNR.
- Integración en edge con NPU: desplegar supresión de ruido en dispositivos Wormhole o Blackhole donde no se dispone de GPU convencional, siempre que la implementación consumidora aporte el enmarcado y la síntesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta comparaciones de SNR de máscara y espectro mejorado frente al modelo original en CPU:

| Metrica | Espectros normalizados reservados | Espectros sinteticos |
|---|---|---|
| SNR mascara / espectro mejorado (dB) | 27,87 / 39,12 | 17,46 / 17,66 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial; con 23,76 M de parámetros en BF16, los pesos ocupan aproximadamente 0,05 GB, por lo que el consumo de memoria es mínimo.
- GPU recomendadas: el checkpoint está pensado para NPUs Tenstorrent Tensix (Wormhole, Blackhole); no se documentan requisitos para GPU convencionales.
- Cabe en GPU de consumo: sí, por tamaño de pesos, aunque la ejecución nativa publicada es para Tensix y no se detalla soporte en CUDA.
- Opciones de despliegue: pila TTNN de Tenstorrent; carga de pesos con `safetensors` para integraciones propias; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / configuracion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/FRCRN_SE_16K-Tenstorrent-Tensix-BF16 | 23,76 M | FFT 640, hop 320, 16 kHz | safetensors BF16 | Apache-2.0 | Hugging Face, orientado a Tenstorrent |
| alibabasglab/FRCRN_SE_16K (modelo base) | 23,76 M | FFT 640, hop 320, 16 kHz | checkpoint original | Apache-2.0 | Hugging Face |
| Alternativas de speech enhancement (p. ej. Demucs, DeepFilterNet) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base, del que esta release es una conversión de pesos; no se dispone de datos de benchmarks frente a otros sistemas de supresión de ruido en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere que la implementación consumidora aporte enmarcado, normalización, aplicación de máscara y síntesis.
- Solo se publican pesos en BF16; no hay cuantizaciones alternativas ni formato GGUF.
- La ejecución nativa está ligada a NPUs Tenstorrent Tensix; el soporte en GPU convencionales no está documentado.
- El modelo base declara Apache-2.0 sin archivo LICENSE propio; esta release incluye LICENSE canónico y NOTICE con la atribución, por lo que conviene revisar ambos antes de uso comercial.
- No se documentan sesgos, tasas de alucinación ni evaluación multilingüe; al operar sobre audio, el riesgo principal es la distorsión de la señal o la atenuación excesiva de componentes de voz.
- Las métricas de SNR reportadas proceden de comparaciones internas frente al modelo en CPU, no de benchmarks independientes.
- El tamaño del repo indicado (0,0 GB) y la carpeta `bf16/` (0,05 GB) deben verificarse al descargar; la fecha de creación del repositorio (2026-11-12) conviene contrastarla con la disponibilidad real.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/FRCRN_SE_16K-Tenstorrent-Tensix-BF16
- Modelo base: https://huggingface.co/alibabasglab/FRCRN_SE_16K
- Script de conversión: https://huggingface.co/Xylolabs/FRCRN_SE_16K-Tenstorrent-Tensix/blob/main/bf16/convert_frcrn.py
- Repositorio de código de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/FRCRN_SE_16K-Tenstorrent-Tensix/blob/main/LICENSE
