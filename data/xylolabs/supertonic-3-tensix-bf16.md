# Xylolabs/supertonic-3-Tensix-BF16

## Resumen

Supertonic 3 para Tenstorrent Tensix es una conversión de pesos del modelo de síntesis de voz Supertonic 3 de Supertone, publicada por Xylolabs. No se trata de un modelo nuevo ni de un reentrenamiento: es un paquete de tensores que reorganiza los inicializadores ONNX originales en safetensors con precisión bf16 para las capas lineales, embeddings y convoluciones, y mantiene float32 en el predictor de duración. El objetivo es facilitar la implementación de las cuatro partes del modelo (predictor de duración, codificador de texto, estimador de vectores y vocoder) sobre la pila TT-NN de Tenstorrent.

El modelo base, Supertonic 3, es un sistema de texto a voz de la familia Supertonic, orientado a síntesis con voces predefinidas y un bucle de síntesis ONNX. Esta conversión no incluye el front-end de texto, los ficheros de voz ni el bucle de síntesis; solo el bundle de tensores y las plantillas de grafo ONNX. Con 99.218.647 parámetros y un repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en CPU y, potencialmente, en aceleradores Tensix.

La relevancia actual reside en la portabilidad: permite a desarrolladores que trabajan con hardware Tenstorrent reutilizar los pesos de Supertonic 3 con transformaciones de layout reversibles y verificadas numéricamente. La licencia OpenRAIL-M del modelo original impone restricciones de uso que se heredan en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en cuatro partes ONNX (predictor de duración, codificador de texto, estimador de vectores, vocoder); detalles internos no disponibles |
| Parametros totales | 99.218.647 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no LLM) |
| Tipos de cuantizacion | bf16 para lineales, embeddings y convoluciones; float32 para el predictor de duración; otros inicializadores en su dtype original |
| Idiomas soportados | no disponible |
| Licencia | openrail (BigScience Open RAIL-M del modelo original) |
| Formato de pesos | safetensors (model.safetensors) y plantillas de grafo ONNX (*.graph.onnx) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Supertonic 3, un sistema de síntesis de voz dividido en cuatro componentes: un predictor de duración, un codificador de texto, un estimador de vectores y un vocoder. No hay información detallada sobre el tipo de red de cada componente en la documentación proporcionada. Esta publicación no entrena ni ajusta el modelo: solo transforma los inicializadores de los ficheros ONNX originales.

La conversión aplica dos cambios principales. Primero, separa los inicializadores ONNX en un fichero safetensors con precisión bf16 para los pesos de capas lineales, embeddings y convoluciones, manteniendo float32 en el predictor de duración y el dtype original en el resto. Segundo, reorganiza los kernels de convolución para operaciones matriciales de TT-NN: las convoluciones 1-D ordinarias usan layout `[kernel × input, output]` y las convoluciones depthwise usan `[tap, channel]`. El `config.json` documenta los 793 tensores con nombres de origen, dtypes, formas y transformaciones de layout, y el mapeo es reversible. Los cuatro ficheros `*.graph.onnx` son plantillas de grafo cuyos inicializadores residen en `model.safetensors`.

## Capacidades

- Síntesis de voz a partir de texto mediante el pipeline de cuatro etapas de Supertonic 3 (duración, codificación de texto, estimación de vectores y vocoder).
- Generación de audio con voces predefinidas del repositorio original (no incluidas en este bundle).
- Restauración de los ficheros ONNX originales con los pesos almacenados, manteniendo las interfaces de entrada/salida originales.
- Verificación numérica de equivalencia por parte frente a los grafos originales en CPU con ONNX Runtime.
- No incluye front-end de texto, ficheros de voz ni bucle de síntesis; estas piezas deben obtenerse del repositorio original.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Implementación de TTS sobre TT-NN: el bundle proporciona los pesos ya reorganizados para operaciones matriciales de Tensix, lo que simplifica la portabilidad de las cuatro etapas del pipeline a hardware Tenstorrent.
- Restauración y validación de ONNX: el script `convert_supertonic.py` permite reconstruir los ficheros ONNX originales con los pesos bf16 almacenados, útil para auditar la conversión o reutilizar el bucle de síntesis original en CPU.
- Reproducibilidad de artefactos: los SHA256 de los cuatro ficheros fuente y la revisión concreta del repositorio original permiten verificar que el bundle deriva de una versión exacta del modelo.
- Integración en pipelines de investigación en hardware: investigadores que comparan precisión bf16 frente a float32 en TTS pueden usar este bundle para medir el impacto de la cuantización en cada parte del modelo (errores relativos documentados entre 0,008 y 0,047).
- Desarrollo de front-ends alternativos: al separar los tensores del grafo, se pueden construir implementaciones propias del bucle de síntesis usando las plantillas ONNX como referencia de formas e interfaces.
- Docencia y experimentación con conversión de modelos: el mapeo reversible y el script de conversión sirven como ejemplo práctico de transformación de inicializadores ONNX a safetensors con cambios de layout.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de audio ni de velocidad en la información disponible. La model card incluye únicamente comprobaciones de equivalencia numérica por parte, con entradas sintéticas (semilla 20261112, batch 1, longitud de texto 16, longitud latente 8) y ONNX Runtime en float32 con optimizaciones desactivadas:

| Parte | Error L2 relativo | SNR de salida |
|---|---:|---:|
| Predictor de duración | 0 (exactamente igual) | exacto |
| Codificador de texto | 0,00975 | 40,22 dB |
| Estimador de vectores | 0,00848 | 41,43 dB |
| Vocoder | 0,04679 | 26,60 dB |

El autor indica explícitamente que se trata de una comprobación de conversión por parte sobre entradas sintéticas, no de una prueba de calidad de audio sobre utterances completas, y que no se reporta velocidad en dispositivo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 99,2 M de parámetros y pesos mayoritariamente bf16, el bundle ocupa aproximadamente 0,2 GB, por lo que la inferencia en CPU es viable.
- GPU recomendadas: no disponibles; el modelo está orientado a la pila TT-NN de Tenstorrent, no a GPU convencionales.
- Compatibilidad con GPU de consumo: no documentada; por tamaño, cabría en cualquier GPU moderna, pero no se han publicado pruebas.
- Opciones de despliegue: ONNX Runtime en CPU para restaurar y verificar los grafos; TT-NN para la implementación en Tensix. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que no se reporta velocidad en dispositivo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada. La comparación se limita a lo que se puede afirmar con certeza:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/supertonic-3-Tensix-BF16 | 99.218.647 | no disponible | openrail (OpenRAIL-M) | safetensors + plantillas ONNX | Conversión para TT-NN, sin entrenamiento |
| Supertone/supertonic-3 | no disponible | no disponible | openrail | ONNX | Modelo original, incluye front-end y voces |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo autónomo: faltan el front-end de texto, los ficheros de voz y el bucle de síntesis, que deben tomarse del repositorio original.
- La licencia OpenRAIL-M del modelo original se hereda y exige cumplir todas las restricciones de uso de su Anexo A; la redistribución debe preservar y hacer cumplir dichas restricciones.
- Los pesos bf16 introducen error numérico respecto al original float32, especialmente en el vocoder (error L2 relativo de 0,04679, SNR de 26,60 dB); no se ha evaluado el impacto en calidad de audio percibida.
- No se han publicado evaluaciones de sesgo, alucinación o robustez lingüística; los idiomas soportados no están documentados.
- El bundle no reporta velocidad ni latencia en hardware Tensix, por lo que su viabilidad en producción sobre TT-NN no está cuantificada.
- El script de conversión es de Xylolabs bajo Apache-2.0, pero el modelo y sus derivados de grafo quedan bajo OpenRAIL-M; Xylolabs no está afiliado ni respaldado por Tenstorrent.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/supertonic-3-Tensix-BF16
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Revisión de referencia del modelo base: https://huggingface.co/Supertone/supertonic-3/tree/724fb5abbf5502583fb520898d45929e62f02c0b
