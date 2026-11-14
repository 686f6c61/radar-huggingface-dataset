# Xylolabs/SenseVoiceSmall-Tensix-BFP8-Components

## Resumen

SenseVoiceSmall-Tensix-BFP8-Components es un archivo parcial de tensores de operadores derivado del modelo de reconocimiento de voz FunAudioLLM/SenseVoiceSmall, redistribuido por Xylolabs en formato safetensors portátil y orientado al hardware Tensix de Tenstorrent. No es un modelo ejecutable de extremo a extremo: contiene únicamente los pesos de los operadores (280 matrices de proyección del codificador y una cabeza CTC en BFP8 almacenado en BF16, más 848 operandos de normalización, sesgos, taps FSMN y constantes estáticas en BF16), lo que suma 1.129 tensores.

El perfil de entrada cubre 70 capas SAN-M y la cabeza CTC, con consultas fijas para coreano, eventos, emoción e ITN activado, y constantes de posición que abarcan 128 filas (cuatro filas de consulta más 124 filas de características acústicas). Se conservan varias variantes de taps FSMN como alternativas. El preprocesado de audio, la selección general de consultas de idioma, la decodificación de tokens y un checkpoint completo ejecutable quedan fuera del archivo.

Su relevancia es acotada pero específica: sirve como material de integración para quien porte SenseVoiceSmall a aceleradores Tenstorrent, ya que los tensores se han decodificado desde el ONNX original preservando cada valor y se han verificado contra el repositorio fuente. El tamaño del repositorio es de 0,5 GB y el archivo portátil ocupa aproximadamente 0,52 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador SAN-M (SenseVoice) con 70 capas y cabeza CTC; componentes de operadores, no un modelo completo |
| Parametros totales | No disponible (el archivo contiene 1.129 tensores de operadores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (perfil de entrada fijo de 128 filas: 4 de consulta y 124 de características acústicas) |
| Tipos de cuantizacion | BFP8 almacenado exactamente en BF16 (8,5 bits por peso empaquetado); BF16 para el resto; variante tap32q8 con valores redondeados a BFP8 guardados en BF16 |
| Idiomas soportados | Coreano (ko); el modelo base SenseVoiceSmall soporta además zh, en, ja y yue |
| Licencia | FunASR Model Open Source License Agreement v1.1 (el loader de Xylolabs es Apache 2.0) |
| Formato de pesos | safetensors (BF16 portátil); datos nativos tileados de aproximadamente 0,38 GB |

## Arquitectura y entrenamiento

El material deriva de SenseVoiceSmall, un reconocedor de voz no autorregresivo basado en un codificador SAN-M con 70 capas y una cabeza CTC para la decodificación. Este repositorio no entrena nada nuevo: extrae los tensores de operadores del ONNX original y los decodifica a safetensors portátiles conservando los valores exactos. Las 280 matrices de proyección del codificador y la cabeza CTC se almacenan como valores BFP8 retenidos en BF16 (8,5 bits por peso cuando se empaquetan), mientras que los 848 operandos de normalización, sesgos, taps y constantes estáticas se guardan en BF16.

La innovación técnica es de formato y verificación, no de modelado. Todos los tensores portátiles coinciden con su valor fuente guardado; los 281 operandos BFP8 y los 848 BF16 vuelven a empaquetarse de forma exacta a través de TT-NN 0.81.1 en contexto de simulador. El ONNX original coincide con su hash LFS primario en Hugging Face y las 919 matrices extraídas coinciden con una reconstrucción fresca. El escalado de consulta ya está aplicado (no debe aplicarse dos veces) y las matrices conservan su disposición de operador guardada, habitualmente `[in, out]`. Se conservan varios layouts de taps FSMN como alternativas, y el integrador debe escoger una implementación FSMN compatible con su representación de taps correspondiente.

## Capacidades

- Reconocimiento de voz (ASR) en coreano cuando se integra con la arquitectura SenseVoiceSmall original, características fbank/LFR/CMVN compatibles y decodificación de tokens.
- Detección de eventos acústicos y emoción, según el perfil de consultas fijas incluidas (coreano, evento, emoción, ITN activado).
- Normalización de texto inversa (ITN) activada en las consultas fijas.
- Salida CTC a través de la cabeza incluida.
- No incluye: preprocesado de audio, selección general de consultas de idioma, decodificación de tokens ni un checkpoint completo ejecutable. El modelo no ejecuta reconocimiento de voz por sí solo.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un archivo de componentes de un modelo ASR.

## Casos de uso

- Porte de SenseVoiceSmall a aceleradores Tenstorrent: el archivo proporciona directamente los 1.129 tensores de operadores en layouts compatibles con Tensix, evitando reextraer y recuantizar desde el ONNX original.
- Integración en pipelines de inferencia ASR sobre hardware Tenstorrent: un equipo que ya disponga del adaptador de arquitectura y el preprocesado puede cargar estos pesos y ejecutar reconocimiento en coreano sin conversión adicional.
- Verificación de fidelidad de cuantización: los tensores BFP8 y BF16 permiten validar que un empaquetado TT-NN reproduce exactamente los valores fuente, útil para pruebas de regresión de compiladores o runtimes.
- Desarrollo de adaptadores de arquitectura: el archivo sirve como referencia de shapes y dtypes (registrados en `component.json`) para quien implemente el grafo SenseVoiceSmall en un backend nuevo.
- Investigación sobre reconocimiento de voz multilingüe: el perfil fijo coreano permite estudiar el comportamiento del codificador SAN-M con consultas de evento, emoción e ITN en ese idioma.
- Evaluación comparativa de layouts FSMN: las variantes de taps retenidas permiten probar distintas implementaciones FSMN contra los mismos pesos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la velocidad no se reporta y que un reconocedor integrado necesita su propia evaluación de voz.

## Requisitos de hardware

- Memoria de dispositivo estimada: aproximadamente 0,38 GB para los pesos de componentes, más espacio para buffers de trabajo.
- Hardware objetivo: aceleradores Tenstorrent Tensix (el empaquetado se verificó con TT-NN 0.81.1 en simulador).
- GPU consumer: no aplica como destino principal; el archivo portátil de 0,52 GB cabe en cualquier GPU con al menos 1 GB de VRAM si se usa para inspección o conversión, pero no ejecuta ASR por sí solo.
- Opciones de despliegue: el loader de referencia usa PyTorch, safetensors y huggingface_hub; la integración requiere la arquitectura SenseVoiceSmall original. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este archivo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xylolabs/SenseVoiceSmall-Tensix-BFP8-Components | Componentes de operadores ASR (SAN-M + CTC) | No disponible (1.129 tensores) | Perfil fijo de 128 filas | ko | FunASR Model License 1.1 | Hugging Face |
| FunAudioLLM/SenseVoiceSmall | Modelo ASR completo (SAN-M + CTC) | No disponible en la información | No disponible | zh, en, ja, ko, yue | FunASR Model License 1.1 | Hugging Face |
| csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17 | Export ONNX para sherpa-onnx | No disponible en la información | No disponible | zh, en, ja, ko, yue | No disponible en la información | Hugging Face |

El archivo de Xylolabs no es directamente comparable en rendimiento con los otros dos porque no es ejecutable de extremo a extremo; su función es la integración en hardware Tensix.

## Limitaciones y advertencias

- No es un modelo ejecutable: requiere un adaptador de arquitectura separado, preprocesado fbank/LFR/CMVN compatible y decodificación de tokens. No realiza reconocimiento de voz por sí solo.
- Cobertura de idioma limitada al perfil fijo coreano; no incluye selección general de consultas de idioma para otros idiomas del modelo base.
- El escalado de consulta ya está plegado en los tensores; aplicarlo de nuevo produce resultados incorrectos.
- Las matrices conservan el layout de operador guardado (habitualmente `[in, out]`); asumir otro layout rompe la integración.
- Debe seleccionarse una única implementación FSMN compatible con su representación de taps; mezclar variantes es incorrecto.
- La licencia FunASR Model Open Source License Agreement v1.1 exige atribución a la fuente y autoría, y retención del nombre del modelo; incluye cláusulas de conducta comunitaria, terminación y revisión que deben revisarse antes de uso comercial.
- El archivo se proporciona tal cual, sin garantía.
- No se han publicado métricas de precisión ni de velocidad para este archivo; cualquier evaluación de calidad debe realizarse sobre el reconocedor integrado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tensix-BFP8-Components
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Export sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17
- Loader de componentes: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tensix-BFP8-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tensix-BFP8-Components/blob/main/LICENSE
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Repositorio de código de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
