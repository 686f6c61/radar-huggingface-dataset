# Xylolabs/supertonic-3-Tensix-Components

## Resumen

Supertonic 3 Tensix Components es un archivo parcial de componentes derivado de Supertone/supertonic-3, un modelo de sintesis de voz (text-to-speech) desarrollado por Supertone. Xylolabs ha extraido y convertido los tensores de operadores de una configuracion fija (F1 fijo, cuatro pasos de inferencia) a safetensors portables, pensados para su integracion en el hardware Tensix de Tenstorrent. No es un modelo autonomo: es un conjunto de pesos de componentes que requiere la arquitectura original y un adaptador de operadores compatible para funcionar.

El archivo contiene un codificador de texto de 64 tokens y grupos de vector-estimator/vocoder para tres tamanos de latentes (32, 48 y 64 frames). La condicion F1 y las constantes de cuatro pasos estan fijas. Los tensores suman 565.576.704 bytes nativos (aproximadamente 0,57 GB) y se almacenan en BF16, con 168 matrices pointwise del vector-estimator conservadas exactamente en BFP8 round-to-nearest.

Su relevancia es acotada pero tecnica: sirve como material de referencia para quienes portan el pipeline TTS de Supertonic 3 a aceleradores Tensix, y documenta con precision formatos, hashes y procedencia de los tensores. No incluye prediccion de duracion, preprocesado de texto, manejo de ruido ni mascaras por frase, por lo que no puede generar voz por si solo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Componentes de un pipeline TTS (codificador de texto, vector-estimator y vocoder); arquitectura original no disponible en la informacion proporcionada |
| Parametros totales | no disponible (565.576.704 bytes de datos nativos de tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | codificador de texto de 64 tokens; latentes de 32, 48 y 64 frames |
| Tipos de cuantizacion | BF16 (1.332 operandos) y BFP8 round-to-nearest (168 matrices pointwise del vector-estimator, 8,5 bits por valor empaquetado) |
| Idiomas soportados | coreano (ko) |
| Licencia | BigScience OpenRAIL-M (el loader de Xylolabs es Apache 2.0) |
| Formato de pesos | safetensors (1.500 tensores portables) |

## Arquitectura y entrenamiento

El archivo no contiene un modelo entrenado de novo, sino tensores de operadores derivados de Supertonic 3, capturados de una configuracion existente con F1 fijo y cuatro pasos. Se organizan en siete grupos: un codificador de texto de 64 tokens (`text_t64`, 138 tensores), y pares vector-estimator/vocoder para latentes de 32, 48 y 64 frames (`ve_t64_l32`, `voc_t64_l32`, `ve_t64_l48`, `voc_t64_l48`, `ve_t64_l64`, `voc_t64_l64`). El vector-estimator de cada bucket tiene 369 tensores y el vocoder 85.

Los 1.500 tensores portables usan almacenamiento BF16. Las 168 matrices pointwise del vector-estimator conservan valores BFP8 round-to-nearest de forma exacta; el resto (1.332 operandos) son BF16. Se retienen preparaciones de query-scale/rotation, step scaling, normalizacion/gamma y tablas. El archivo `component.json` registra formas, hashes, dtypes almacenados, formatos nativos y layouts. No se proporcionan datos sobre el entrenamiento original (tokens, composicion del dataset, RLHF/DPO) en la informacion disponible.

## Capacidades

- Suministro de tensores de operadores para un codificador de texto TTS de 64 tokens.
- Suministro de grupos vector-estimator y vocoder para latentes de 32, 48 y 64 frames.
- Condicionamiento F1 fijo y constantes de cuatro pasos de inferencia.
- Conservacion de preparaciones de query-scale/rotation, step scaling, normalizacion/gamma y tablas.
- Verificacion de integridad mediante el loader: hashes, nombres, formas, dtypes declarados y valores finitos.
- No incluye sintesis de voz completa, prediccion de duracion, preprocesado de texto ni manejo de ruido/longitud.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje generativo).

## Casos de uso

- Portado de Supertonic 3 a aceleradores Tenstorrent Tensix: los tensores preparados y el `component.json` permiten a un equipo de integracion mapear operadores a TT-NN sin reextraer los pesos desde el modelo original.
- Validacion de procedencia en pipelines de conversion: los hashes y dtypes declarados permiten auditar que los operandos conservados coinciden con la fuente y detectar desviaciones en la reconstruccion.
- Investigacion de cuantizacion BFP8 en TTS: las 168 matrices pointwise conservadas en BFP8 permiten estudiar el impacto de 8,5 bits por valor en el vector-estimator frente a BF16.
- Benchmarking de repacking de formatos nativos: el archivo documenta que los tensores sobreviven al repacking nativo de TT-NN 0.81.1 en contexto de simulador, util para comparar herramientas de conversion.
- Desarrollo de adaptadores de operadores: un integrador puede usar los grupos por bucket (32/48/64 frames) para probar adaptadores de atencion y convolucion en el hardware objetivo.
- Referencia para reconstruccion de tablas de estilo: la comparacion con una reconstruccion independiente (diferencia maxima de 9,016e-7 en FP32) sirve como caso de estudio de limites de procedencia en constantes optimizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se asigna una evaluacion completa de forward TTS ni una evaluacion de escucha a este archivo standalone, y que no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo estimada: aproximadamente 0,57 GB solo para los pesos de los componentes, mas espacio para buffers de trabajo.
- Hardware objetivo: aceleradores Tenstorrent Tensix (repacking verificado con TT-NN 0.81.1 en contexto de simulador).
- GPU consumer: no aplica como objetivo; el archivo esta pensado para integracion en Tensix, no para inferencia directa en GPU.
- Despliegue: carga mediante PyTorch, safetensors y huggingface_hub con el loader `load_components.py`; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Xylolabs/supertonic-3-Tensix-Components | no disponible (0,57 GB de tensores) | 64 tokens de texto; latentes 32/48/64 frames | OpenRAIL-M | Hugging Face (0 descargas) | Archivo parcial de componentes, no ejecutable de forma autonoma |
| Supertone/supertonic-3 | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face | Modelo base completo del que derivan los componentes |
| Otros modelos TTS | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere la arquitectura original, un adaptador de operadores compatible y entradas por frase; no forma un runner de sintesis de voz.
- Faltan componentes esenciales: preprocesado de texto, prediccion de duracion, manejo de ruido/longitud, mascaras por frase, shifts y entradas posicionales.
- Condicionamiento F1 y constantes de cuatro pasos fijos, lo que limita la variabilidad de locutor y de pasos de inferencia.
- Solo idioma coreano (ko); no se documenta soporte multilingue.
- Licencia OpenRAIL-M con restricciones de uso y distribucion (parrafo 5 y Anexo A); los destinatarios deben recibir la licencia y el aviso de restricciones.
- Limite de procedencia: la reconstruccion independiente de cuatro tablas de style-key difiere de las constantes optimizadas existentes hasta 9,016e-7 en FP32, cruzando fronteras BF16 en cinco coeficientes por bucket de latentes; el archivo preserva los valores fuente.
- Sin evaluacion de escucha ni de velocidad; el rendimiento real en hardware Tensix no esta cuantificado.
- Riesgo de alucinacion y sesgos: no aplica directamente al no ser un modelo generativo de texto, pero los sesgos del modelo base TTS no se documentan en la informacion disponible.
- Repositorio sin descargas ni likes en el momento de la consulta; soporte comunitario limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/supertonic-3-Tensix-Components
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Loader de componentes: https://huggingface.co/Xylolabs/supertonic-3-Tensix-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/supertonic-3-Tensix-Components/blob/main/LICENSE
- Repositorio de codigo de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
