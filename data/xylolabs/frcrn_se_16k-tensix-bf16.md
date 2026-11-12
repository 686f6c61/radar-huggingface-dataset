# Xylolabs/FRCRN_SE_16K-Tensix-BF16

## Resumen

FRCRN_SE_16K-Tensix-BF16 es una conversión del modelo de mejora de voz FRCRN_SE_16K (originalmente publicado por alibabasglab en el ecosistema ClearerVoice-Studio de ModelScope) realizada por Xylolabs, orientada a su despliegue sobre aceleradores Tenstorrent mediante la pila TT-NN/Tensix. No se trata de un modelo nuevo ni reentrenado: es una reescritura de los pesos del checkpoint original en un formato adecuado para implementaciones TT-NN, con las convoluciones complejas expresadas como matrices de bloques reales, las capas de normalización por lotes plegadas en las convoluciones y todos los tensores almacenados en bfloat16.

El modelo resuelve un problema concreto de procesamiento de audio: la supresión de ruido y la mejora de voz en señales de 16 kHz. Trabaja en el dominio espectral, tomando como entrada un espectro complejo normalizado y produciendo una máscara compleja que, aplicada a la señal original, atenúa el ruido. Con 23.760.720 parámetros, es un modelo compacto pensado para inferencia de baja latencia en flujos de audio en tiempo real o casi real.

Su relevancia actual es de nicho pero clara: cubre el hueco de pesos de FRCRN listos para hardware Tenstorrent, algo poco habitual en el ecosistema, y lo hace bajo licencia Apache-2.0 con un script de conversión reproducible y verificaciones de equivalencia numérica documentadas. Es un artefacto de infraestructura más que un modelo de propósito general: no genera texto, no razona y no tiene capacidades multimodales más allá del audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FRCRN (red convolucional compleja con dos UNets y memorias FSMN) |
| Parametros totales | 23.760.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de espectro complejo de forma [1, 2, 321, 51] (640 puntos FFT, hop de 320 muestras, 51 tramas) |
| Tipos de cuantizacion | bfloat16 (todos los tensores almacenados en bf16); el original opera en float32 |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) + config.json |

## Arquitectura y entrenamiento

FRCRN es una arquitectura de mejora de voz en el dominio complejo. El modelo contiene dos subredes UNet (identificadas como `u1` y `u2` en los nombres de tensor) que operan sobre partes real e imaginaria del espectro. Las convoluciones complejas se representan como matrices de bloques reales de la forma `[[Wr, -Wi], [Wi, Wr]]`, y las capas de normalización por lotes posteriores se pliegan en los canales de salida de cada convolución. Cada UNet incorpora memorias FSMN (feedforward sequential memory networks) cuya proyección lineal se almacena con layout `[output, input, 1, 1]`, y `config.json` registra el eje y el orden de cada memoria.

Esta versión concreta no introduce entrenamiento adicional: es una conversión determinista del checkpoint original de alibabasglab (revisión `3766e6a64b0d8cb58f08d913d617bf129f11ed53`, SHA256 `b22256adbb91b68cf5a3db8f6657a4fb17066eecd5f069803e59c186c1cf3ebb`). El proceso, reproducible con `convert_frcrn.py` y el paquete `frcrn_se` de ClearerVoice-Studio (clearvoice 0.1.2), incluye una comparación en CPU contra el modelo original sobre ocho espectros sintéticos. La innovación técnica principal es el layout de tensores apto para TT-NN: convolución de codificador `[output, input, kernel frequency, kernel time]`, convolución transpuesta de decodificador `[input, output, kernel frequency, kernel time]` y canales complejos ordenados como reales seguidos de imaginarios. No se documentan datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades

- Supresión de ruido y mejora de voz en audio de 16 kHz, operando sobre espectro complejo normalizado.
- Predicción de máscara compleja mediante `tanh(u1) + tanh(u2)`, aplicable a la señal de entrada para atenuar ruido.
- Procesamiento por tramas con FFT de 640 puntos y hop de 320 muestras (51 tramas por ventana de entrada).
- Pesos en bf16 con layout optimizado para implementaciones TT-NN sobre hardware Tenstorrent.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en sentido textual; es independiente del idioma hablado.
- No dispone de modo thinking, visión ni audio generativo; la salida es una máscara espectral, no audio sintetizado (el consumidor debe aplicar enmarcado, normalización, aplicación de máscara y síntesis).

## Casos de uso

- Supresión de ruido en llamadas VoIP y videoconferencia: el modelo procesa ventanas de 51 tramas a 16 kHz y devuelve una máscara que el pipeline aplica antes de la síntesis, reduciendo ruido de fondo en tiempo real sobre aceleradores Tenstorrent.
- Preprocesado para ASR: al mejorar la relación señal-ruido antes de un sistema de reconocimiento de voz, se reducen errores de transcripción en entornos ruidosos; el modelo es lo bastante pequeño (23,7 M de parámetros) para ejecutarse en paralelo al ASR.
- Limpieza de grabaciones de campo y entrevistas: se aplica la máscara compleja sobre el espectro de la grabación completa por ventanas solapadas para producir audio más inteligible sin reentrenamiento.
- Pipelines de audio en dispositivos edge con Tenstorrent: al estar en bf16 y con layout TT-NN, encaja en despliegues de bajo consumo donde no hay GPU convencional disponible.
- Investigación en procesamiento de voz: sirve como referencia reproducible para comparar implementaciones TT-NN frente a la implementación CPU original, gracias a `equivalence.json` y al script de conversión.
- Integración en herramientas de accesibilidad y audífonos: la baja huella de parámetros permite incorporar la mejora de voz en cadenas de procesamiento embebidas con latencia controlada.
- Evaluación de hardware Tenstorrent: útil como carga de trabajo de audio representativa para medir rendimiento y validar kernels TT-NN de convolución compleja y FSMN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de tarea (PESQ, STOI, DNSMOS ni similares) en la información disponible. Las únicas métricas documentadas son verificaciones de equivalencia numérica frente al modelo original en CPU (float32), medidas como SNR en dB:

| Conjunto | Transformación float32, SNR de máscara | bf16 almacenado, SNR de máscara | bf16 almacenado, SNR de espectro mejorado |
|---|---:|---:|---:|
| Espectros normalizados reservados (held-out) | 77,97 dB | 27,87 dB | 39,12 dB |
| Espectros sintéticos, semilla 20261112 | 96,55 dB | 17,46 dB | 17,66 dB |

Estas cifras miden la concordancia con el modelo CPU original, no la calidad de la mejora de audio ni la velocidad en dispositivo. Los espectros sintéticos son valores aleatorios independientes y no constituyen un benchmark de calidad de audio. Los datos reservados no se distribuyen.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 48 MB solo para pesos en bf16 (23,76 M de parámetros × 2 bytes); el consumo real depende del runtime y de los buffers de activación.
- GPU recomendadas: no aplica de forma nativa; el modelo está orientado a aceleradores Tenstorrent (Tensix) mediante TT-NN. Puede ejecutarse en CPU con safetensors y PyTorch para inspección o conversión.
- Cabe en cualquier GPU consumer moderna si se porta a un runtime convencional, dado su reducido tamaño; en el formato publicado está pensado para TT-NN.
- Opciones de despliegue: TT-NN sobre hardware Tenstorrent; lectura de pesos con `safetensors` en CPU; conversión reproducible con `convert_frcrn.py` y clearvoice 0.1.2.
- Latencia y throughput: no disponibles; no se documentan mediciones en dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Dominio | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FRCRN_SE_16K-Tensix-BF16 (este) | 23,76 M | Espectro complejo 16 kHz | safetensors bf16, TT-NN | Apache-2.0 | Hugging Face |
| alibabasglab/FRCRN_SE_16K (original) | 23,76 M (misma arquitectura) | Espectro complejo 16 kHz | checkpoint PyTorch float32 | Apache-2.0 | Hugging Face / ModelScope |
| Otros modelos de mejora de voz de ClearerVoice-Studio (MossFormer, etc.) | no disponible en la información proporcionada | Audio de voz | PyTorch | no disponible | ModelScope / GitHub |

La comparación directa con alternativas de la misma categoría (por ejemplo, otros modelos de supresión de ruido del ecosistema ClearerVoice) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo de texto ni multimodal: solo produce una máscara espectral; el consumidor debe implementar enmarcado, normalización, aplicación de máscara y síntesis.
- La entrada está fijada a 16 kHz, FFT de 640 puntos, hop de 320 muestras y ventanas de 51 tramas; no admite otras frecuencias de muestreo sin remuestreo previo.
- La conversión a bf16 introduce error numérico respecto al original en float32: la SNR de máscara cae de 77,97 dB a 27,87 dB en el conjunto reservado, lo que puede ser relevante en aplicaciones que exijan alta fidelidad numérica.
- No se han publicado métricas de calidad de audio (PESQ, STOI, DNSMOS) ni evaluaciones subjetivas; no hay evidencia documentada de rendimiento en tareas reales.
- Los datos de validación reservados no se distribuyen, lo que limita la reproducibilidad externa de las comprobaciones.
- Riesgo de sesgos: no documentado; al ser un modelo de audio, puede comportarse de forma desigual ante determinados tipos de ruido, acentos o condiciones acústicas no representadas en su entrenamiento original.
- Riesgo de alucinación en el sentido de artefactos de audio: la máscara puede introducir distorsión o supresión excesiva de voz en condiciones fuera de distribución.
- Licencia Apache-2.0 permite uso comercial, pero el autor indica que el checkpoint original no incluye archivo LICENSE y que este repositorio añade la licencia canónica y un NOTICE con la procedencia y los cambios.
- No está afiliado ni respaldado por Tenstorrent; el soporte de hardware depende de la madurez de TT-NN para las operaciones requeridas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/FRCRN_SE_16K-Tensix-BF16
- Modelo base original: https://huggingface.co/alibabasglab/FRCRN_SE_16K
- Revisión concreta del checkpoint original: https://huggingface.co/alibabasglab/FRCRN_SE_16K/tree/3766e6a64b0d8cb58f08d913d617bf129f11ed53
- ClearerVoice-Studio (GitHub): https://github.com/modelscope/ClearerVoice-Studio
- Paper de FRCRN: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
