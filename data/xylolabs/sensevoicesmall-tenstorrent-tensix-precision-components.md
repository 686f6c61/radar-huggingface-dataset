# Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix-Precision-Components

## Resumen

SenseVoiceSmall-Tenstorrent-Tensix-Precision-Components es un archivo parcial de componentes de pesos derivado del modelo de reconocimiento de voz FunAudioLLM/SenseVoiceSmall, publicado por Xylolabs. No se trata de un modelo completo listo para inferencia, sino de un conjunto de proyecciones y cabezas alternativas (280 proyecciones BFP4, 281 operandos BFP8 de proyección/cabeza CTC y 281 alternativas BF16 de proyección/cabeza) decodificadas a safetensors portables para su uso en hardware Tenstorrent Tensix. El objetivo es ofrecer variantes de precisión (BFP4, BFP8, BF16) que puedan integrarse en un reconocedor de voz completo sobre aceleradores Tensix.

El archivo conserva los valores ya cuantizados tal cual, sin recomprimir, y mantiene el orden de operador [in, out] de las matrices originales, con el escalado de query ya plegado. Requiere unos 0,84 GB de memoria de dispositivo solo para los pesos de los componentes, más espacio para buffers de trabajo. La integración arquitectónica, los operandos compartidos compatibles, el preprocesado y la decodificación de tokens corren a cargo del usuario.

Es relevante porque facilita el despliegue de reconocimiento de voz sobre la pila TT-NN de Tenstorrent con distintas precisiones numéricas, aunque no incluye evaluación de tarea ni velocidad: se trata de una verificación de representación y procedencia, no de un modelo evaluado de extremo a extremo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Componentes de proyección y cabeza derivados de SenseVoiceSmall (encoder con proyecciones y cabeza CTC); no se especifica la arquitectura completa en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (round-to-nearest tras BF16, 4,5 bits/valor empaquetados), BFP8 (round-to-nearest tras BF16, 8,5 bits/valor empaquetados), BF16 |
| Idiomas soportados | ko (coreano), según la model card; el modelo base SenseVoiceSmall soporta más idiomas, pero esta exportación declara solo coreano |
| Licencia | funasr-model-license-1.1 (FunASR Model Open Source License Agreement v1.1) |
| Formato de pesos | safetensors (los tres ficheros portables almacenan BF16; BFP4 y BFP8 conservan los valores ya cuantizados) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una exportación de componentes de pesos derivados de SenseVoiceSmall. El perfil de origen tiene 128 filas de entrada de características, con cuatro filas de query fijas para coreano/evento/emoción/ITN activado. Las matrices conservan el orden [in, out] y el escalado de query ya está plegado. El archivo incluye tres grupos: 280 proyecciones BFP4 del encoder, 281 operandos BFP8 de proyección del encoder y cabeza CTC, y 281 alternativas BF16 de proyección/cabeza.

Los tres grupos siguen la misma ruta de preparación «BF16-first»; existe un archivo BFP8 anterior con valores de matriz redondeados de forma distinta. Los ficheros portables almacenan BF16, pero los de BFP4 y BFP8 retienen exactamente los valores ya cuantizados, por lo que su tamaño de descarga no refleja la densidad empaquetada. En total, los datos nativos en tiles suman 837.872.640 bytes. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO, ya que se trata de una conversión de pesos, no de un entrenamiento.

## Capacidades

- Reconocimiento de voz (ASR) como parte de un reconocedor integrado basado en SenseVoiceSmall, una vez combinado con los operandos compartidos y el pipeline de preprocesado y decodificación.
- Soporte de tres precisiones numéricas alternativas (BFP4, BFP8, BF16) para adaptarse a los requisitos de memoria y precisión del hardware Tensix.
- Cabeza CTC incluida en las variantes BFP8 y BF16 (281 operandos); para conservar el perfil BFP4 guardado debe usarse la cabeza CTC BFP8 suministrada en este archivo.
- Perfil de query fijo para coreano con marcas de evento, emoción e ITN activado.
- No incluye tool calling, function calling, capacidades de agente, visión ni audio más allá del propio ASR.
- No se declaran capacidades multilingües en esta exportación: el campo de idioma solo indica coreano.

## Casos de uso

- Despliegue de ASR sobre aceleradores Tenstorrent Tensix: el archivo proporciona las proyecciones y cabezas necesarias para integrar un reconocedor SenseVoiceSmall en la pila TT-NN, eligiendo entre BFP4, BFP8 o BF16 según el presupuesto de memoria y precisión.
- Evaluación de precisión numérica en hardware: permite comparar el comportamiento de un mismo reconocedor con proyecciones BFP4, BFP8 y BF16, útil para estudiar el impacto del redondeo en la calidad de transcripción.
- Investigación en cuantización de modelos de voz: los valores ya cuantizados y la conservación exacta de los mismos permiten reproducir experimentos de cuantización BF16-first sin recomprimir.
- Integración en pipelines de reconocimiento de voz en coreano con marcas de emoción y eventos: el perfil de query fijo incluye estas etiquetas, adecuado para aplicaciones de análisis de audio en coreano.
- Prototipado en simulador TT-NN: el archivo se ha verificado repackeando exactamente a través de TT-NN 0.81.1 en contexto de simulador, lo que facilita el desarrollo previo al despliegue en silicio.
- Auditoría de procedencia de pesos: los hashes, formas, dtypes y etiquetas de formato nativo en `component.json`, junto con las comprobaciones de checksums, permiten verificar la integridad de la conversión en entornos de producción regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se asigna ninguna puntuación de tarea al archivo independiente y que no se reporta velocidad. Las únicas verificaciones documentadas son de representación y procedencia: los 842 tensores guardados son finitos, se decodifican sin cambiar valores y se repackean exactamente a través de TT-NN 0.81.1 en simulador; el ONNX original coincide con su identidad LFS primaria en Hugging Face y sus 919 arrays de origen coinciden con una reconstrucción fresca.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 0,84 GB solo para los pesos de los componentes, más espacio para buffers de trabajo.
- Hardware objetivo: aceleradores Tenstorrent Tensix, con la pila TT-NN (versión verificada 0.81.1 en simulador).
- GPU consumer: no aplica; este archivo está pensado para hardware Tensix, no para GPU convencionales. No se documenta compatibilidad con CUDA.
- Despliegue: carga mediante `load_components.py` con PyTorch, safetensors y huggingface_hub; requiere integración arquitectónica propia, operandos compartidos del archivo complementario, preprocesado y decodificación de tokens.
- Latencia y throughput: no disponibles; la model card indica que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix-Precision-Components | no disponible (componentes parciales) | no disponible | ko | funasr-model-license-1.1 | safetensors (BFP4/BFP8/BF16) | Hugging Face, 0 descargas |
| FunAudioLLM/SenseVoiceSmall (modelo base) | no disponible en la información proporcionada | no disponible | varios (según model card original) | funasr-model-license-1.1 | no disponible en la información proporcionada | Hugging Face |
| Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix-BFP8-Components (archivo complementario) | no disponible (componentes compartidos: normalización, bias, FSMN/tap y operandos estáticos) | no disponible | ko | funasr-model-license-1.1 | safetensors (BFP8) | Hugging Face |

No se dispone de datos de rendimiento para comparar; la información proporcionada no incluye benchmarks del modelo base ni de alternativas.

## Limitaciones y advertencias

- No es un modelo completo: es un archivo parcial de componentes que requiere integración arquitectónica, operandos compartidos compatibles (del archivo complementario BFP8-Components), preprocesado y decodificación de tokens para funcionar como reconocedor.
- No se asigna ninguna puntuación de tarea al archivo independiente; se requiere evaluación de voz sobre los operandos seleccionados antes de usarlo en producción.
- Mezclar alternativas de este archivo con las del archivo complementario BFP8 (que siguió una ruta de redondeo distinta) exige su propia evaluación del reconocedor integrado.
- El campo de idioma solo declara coreano; no se garantiza soporte de otros idiomas en esta exportación.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse sobre el reconocedor integrado.
- Licencia: FunASR Model Open Source License Agreement v1.1, que permite copia, modificación y compartición con atribución de fuente/autor y retención del nombre del modelo; incluye disposiciones sobre uso de referencia/aprendizaje, conducta comunitaria, terminación y revisión que deben revisarse antes de uso comercial.
- Los tamaños de descarga de los ficheros BFP4 y BFP8 no describen la densidad empaquetada, ya que todos los ficheros portables almacenan BF16.
- No se reporta velocidad ni latencia; el rendimiento en hardware real no está verificado más allá del repackeo en simulador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix-Precision-Components
- Modelo base SenseVoiceSmall: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Archivo complementario BFP8: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix-BFP8-Components
- Código de carga de componentes: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix-Precision-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix-Precision-Components/blob/main/LICENSE
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
