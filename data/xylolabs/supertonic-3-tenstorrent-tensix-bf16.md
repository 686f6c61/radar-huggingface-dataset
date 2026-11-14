# Xylolabs/supertonic-3-Tenstorrent-Tensix-BF16

## Resumen

Supertonic 3 for Tenstorrent Tensix (BF16) es un paquete de pesos derivado de Supertone/supertonic-3, un modelo de sintesis de voz (text-to-speech) desarrollado originalmente por Supertone. Xylolabs publica esta variante con los inicializadores ONNX del modelo original almacenados por separado en safetensors, con los pesos de las capas lineales, embeddings y convoluciones convertidos a bfloat16 y las convoluciones reordenadas para operaciones matriciales de TT-NN (la libreria de Tenstorrent para sus aceleradores Tensix). No hay entrenamiento ni ajuste fino: es una conversion de formato y precision.

El artefacto contiene 99.218.647 parametros distribuidos en 793 tensores (0,2 GB en disco antes del empaquetado TT-NN) y cubre las cuatro partes del modelo original: predictor de duracion, encoder de texto, estimador de vectores y vocoder. El predictor de duracion conserva float32 original; el resto usa bf16. Los cuatro ficheros `*.graph.onnx` actuan como plantillas de grafo cuyos inicializadores viven en `model.safetensors`.

Es relevante para quienes despliegan TTS sobre hardware Tenstorrent (Wormhole, Blackhole) o necesitan reutilizar los pesos de Supertonic 3 en pipelines TT-NN sin partir de los ONNX originales. La licencia es OpenRAIL-M heredada del modelo base, con todas las restricciones de uso de su anexo A. El repositorio no incluye voces ni el front-end de texto: eso lo aporta el repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS de cuatro componentes ONNX (predictor de duracion, encoder de texto, estimador de vectores, vocoder); topologia interna no detallada en la informacion disponible |
| Parametros totales | 99.218.647 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no LLM; entradas sinteticas de prueba con longitud de texto 16 y latente 8) |
| Tipos de cuantizacion | bf16 (lineales, embeddings y convoluciones) y float32 (predictor de duracion y otros inicializadores); no se documentan GGUF, int8 ni int4 |
| Idiomas soportados | no disponible |
| Licencia | OpenRAIL-M (BigScience Open RAIL-M, heredada de Supertone/supertonic-3); codigo de conversion bajo Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + plantillas de grafo `*.graph.onnx`; script `convert_supertonic.py` para materializar ONNX |

## Arquitectura y entrenamiento

El paquete reproduce la arquitectura del modelo base Supertonic 3, organizada en cuatro submodelos ONNX: un predictor de duracion, un encoder de texto, un estimador de vectores y un vocoder. La conversion de Xylolabs almacena los inicializadores de cada grafo en un unico safetensors, con las lineales, embeddings y convoluciones en bf16 y el predictor de duracion intacto en float32. Las convoluciones 1-D ordinarias se reorganizan con forma `[kernel × input, output]` y las convoluciones depthwise con `[tap, channel]`, de modo que encajen en las operaciones matriciales de TT-NN. El mapeo es reversible y `config.json` documenta los 793 tensores con nombres de origen, dtypes, formas y transformaciones de layout.

No hubo entrenamiento ni ajuste: la model card indica explicitamente "No training". El script `convert_supertonic.py` permite dos flujos: reconstruir los ONNX originales desde los pesos guardados (`--restore`, revision `724fb5abbf5502583fb520898d45929e62f02c0b`) o reproducir el bundle a partir de los cuatro ONNX originales. La verificacion en CPU compara cada parte restaurada con su grafo original usando ONNX Runtime en float32 con optimizaciones desactivadas, entradas sinteticas (semilla 20261112, batch 1, texto 16, latente 8): el predictor de duracion coincide exactamente, el encoder de texto presenta error L2 relativo de 0,00975 (SNR 40,22 dB), el estimador de vectores 0,00848 (41,43 dB) y el vocoder 0,04679 (26,60 dB). Los SHA256 de los cuatro ficheros fuente estan registrados en `config.json`.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto, usando los cuatro componentes del pipeline Supertonic 3.
- Prediccion de duracion fonetica mediante el predictor de duracion en float32.
- Codificacion de texto y estimacion de vectores latentes para la generacion acustica.
- Generacion de forma de onda mediante el vocoder.
- Despliegue sobre aceleradores Tenstorrent Tensix a traves de TT-NN con pesos bf16.
- Reconstruccion de los grafos ONNX originales para ejecucion en ONNX Runtime en CPU.
- No incluye tool calling, agentes, vision, audio de entrada ni modo de razonamiento: es un artefacto TTS.
- No incluye voces ni front-end de texto; esos recursos provienen del repositorio Supertone/supertonic-3.

## Casos de uso

- Despliegue de TTS en hardware Tenstorrent: cargar `model.safetensors` y las plantillas `*.graph.onnx` en TT-NN para ejecutar la sintesis sobre Wormhole o Blackhole, aprovechando el empaquetado bf16 y el reordenamiento de convoluciones ya hecho.
- Reconstruccion de los ONNX originales: usar `convert_supertonic.py . restored --restore` para recuperar los cuatro grafos con interfaces de entrada/salida identicas y ejecutarlos con el bucle de sintesis ONNX original en CPU.
- Integracion en pipelines de servidores sin GPU: al restaurar los ONNX, el modelo puede correr en ONNX Runtime en CPU con operaciones float32 sobre los pesos bf16 almacenados, util para entornos con restricciones de acelerador.
- Verificacion de integridad de conversiones: los SHA256 y `equivalence.json` permiten auditar que los pesos corresponden a la revision `724fb5abbf5502583fb520898d45929e62f02c0b` del modelo base antes de desplegar.
- Investigacion sobre precision mixta en TTS: comparar el error L2 relativo por componente (vocoder 0,04679 frente a encoder 0,00975) para decidir que partes toleran bf16 en produccion.
- Reproducibilidad de bundles de pesos: regenerar el paquete desde los ONNX originales con `convert_supertonic.py original/onnx output` para construir variantes propias sobre TT-NN.
- Base para portar Supertonic 3 a otros backends: el mapeo reversible documentado en `config.json` sirve como referencia para reordenar convoluciones en otras librerias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta comprobaciones de equivalencia por componente frente a los grafos originales en CPU:

| Parte | Error L2 relativo | SNR de salida |
|---|---:|---:|
| Predictor de duracion | 0 (identico) | exacto |
| Encoder de texto | 0,00975 | 40,22 dB |
| Estimador de vectores | 0,00848 | 41,43 dB |
| Vocoder | 0,04679 | 26,60 dB |

Estas cifras corresponden a entradas sinteticas (semilla 20261112, batch 1, texto 16, latente 8) y no constituyen una prueba de calidad de audio sobre locuciones completas. La model card indica explicitamente que no se reporta velocidad.

## Requisitos de hardware

- VRAM/ memoria: los pesos almacenados ocupan unos 0,20 GB; hay que prever memoria adicional en dispositivo para el empaquetado TT-NN y los buffers de trabajo.
- Hardware objetivo: aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN.
- Consumer GPU: no se documenta soporte CUDA; el flujo alternativo es ONNX Runtime en CPU tras restaurar los grafos.
- Despliegue: TT-NN para Tensix; ONNX Runtime (CPU, float32) para los grafos restaurados. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Dependencias de conversion y comprobacion: torch, numpy, safetensors, ONNX y ONNX Runtime.
- Latencia y throughput: no disponibles; la model card no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/supertonic-3-Tenstorrent-Tensix-BF16 | 99.218.647 | no disponible (TTS) | safetensors + plantillas ONNX | OpenRAIL-M | Hugging Face, 59 descargas |
| Supertone/supertonic-3 (base) | no disponible en la informacion proporcionada | no disponible | ONNX | no disponible en la informacion proporcionada (el derivado hereda OpenRAIL-M) | Hugging Face |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el front-end de texto, las voces y el bucle de sintesis del repositorio Supertone/supertonic-3; este repositorio no incluye ficheros de voz.
- La conversion a bf16 introduce error medible, especialmente en el vocoder (SNR 26,60 dB), el componente con mayor desviacion frente al original.
- Las comprobaciones de equivalencia usan entradas sinteticas y no evaluan la calidad perceptual del audio en locuciones completas.
- No se documentan sesgos, cobertura de idiomas ni riesgos de alucinacion; al ser TTS, los riesgos tipicos (pronunciacion incorrecta, artefactos acusticos) no estan cuantificados aqui.
- La licencia OpenRAIL-M impone restricciones de uso del anexo A del acuerdo BigScience; el uso comercial y la redistribucion deben cumplirlas y preservar dichas restricciones en copias derivadas.
- El codigo `convert_supertonic.py` tiene licencia Apache-2.0, distinta de la de los pesos.
- Xylolabs no esta afiliado ni respaldado por Tenstorrent.
- El modelo esta anclado a la revision `724fb5abbf5502583fb520898d45929e62f02c0b` del modelo base; cambios posteriores en el original no estan reflejados.
- No hay garantia de que el bundle funcione en TT-NN sin ajustes de empaquetado y buffers adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/supertonic-3-Tenstorrent-Tensix-BF16
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Revision del modelo base usada: https://huggingface.co/Supertone/supertonic-3/tree/724fb5abbf5502583fb520898d45929e62f02c0b
- Licencia: https://huggingface.co/Xylolabs/supertonic-3-Tenstorrent-Tensix-BF16/blob/main/LICENSE
- Codigo de conversion: https://huggingface.co/Xylolabs/supertonic-3-Tenstorrent-Tensix-BF16/blob/main/convert_supertonic.py
- Repositorio de codigo de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
