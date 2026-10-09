# TamPham92/neucodec-onnx-decoder-int8

## Resumen

Este repositorio contiene una copia sin modificar del decodificador de NeuCodec compilado a ONNX y cuantizado a int8. NeuCodec es un codec neuronal de audio desarrollado por Neuphonic; este artefacto implementa únicamente la etapa de decodificacion, es decir, la conversion de tokens de codec a forma de onda, y no incluye el codificador ni el modelo completo. El unico fichero publicado es `model.onnx`, de 312.292.102 bytes (aproximadamente 0,3 GB), con hash SHA-256 verificado respecto al repositorio original.

El repositorio lo mantiene el usuario TamPham92 como espejo del original `neuphonic/neucodec-onnx-decoder-int8`, con el objetivo de que el editor de video open source CrabbyCut pueda descargar el decodificador para su funcion de doblaje offline VieNeu-TTS sin exigir a cada usuario final que inicie sesion en Hugging Face. No se trata, por tanto, de un modelo nuevo ni de un reentrenamiento: es una redistribucion con licencia Apache-2.0.

Su relevancia practica es la de un componente de inferencia de huella reducida para sintesis de voz en dispositivo. Al estar en formato ONNX y cuantizado a int8, se puede ejecutar sin PyTorch y con requisitos de memoria muy bajos, lo que encaja en aplicaciones de escritorio, moviles o web que necesitan reconstruir audio localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de codec neuronal de audio (NeuCodec); estructura interna detallada no disponible |
| Parametros totales | no disponible (solo se declara un fichero ONNX int8 de 312.292.102 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje, procesa secuencias de tokens de codec |
| Tipos de cuantizacion | int8 (unico artefacto publicado) |
| Idiomas soportados | no disponible (el decodificador es independiente del idioma; depende del codificador y del modelo TTS que genere los tokens) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, int8) |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | audio-to-audio |
| Modelo base | neuphonic/neucodec |
| Hash SHA-256 | 3ddd9e56396e6029e0e948ac0255c89c803f981f23dcf4c154f50820bd74a6b3 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del decodificador en la documentacion proporcionada. La model card indica unicamente que se trata de una compilacion ONNX del decodificador de NeuCodec, cuantizada a int8, y remite al repositorio original para las instrucciones de uso. NeuCodec pertenece a la familia de codecs neuronales de audio de Neuphonic, cuyo proposito es representar audio como una secuencia discreta de tokens de baja tasa de bits que posteriormente se reconstruye con un decodificador.

En cuanto al entrenamiento, no se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica especifica de esta exportacion mas alla de la cuantizacion int8 y el empaquetado ONNX, orientados a reducir el consumo de memoria y a eliminar la dependencia de PyTorch en tiempo de inferencia. Es importante subrayar que este repositorio no entrena ni modifica nada: es un espejo binario del artefacto publicado por Neuphonic.

## Capacidades

- Decodificacion de audio: reconstruye forma de onda a partir de los tokens de codec generados por NeuCodec, que es la operacion `audio-to-audio` declarada en el pipeline.
- Inferencia sin PyTorch: al ser un grafo ONNX, se ejecuta con ONNX Runtime en CPU, GPU o entornos web.
- Huella reducida: la cuantizacion int8 permite cargar el decodificador en dispositivos con memoria limitada.
- Integracion en pipelines de sintesis de voz: es la etapa final de un sistema TTS basado en NeuCodec, despues del modelo que produce los tokens.
- Verificacion de integridad: el consumidor previsto (CrabbyCut) comprueba el SHA-256 tras cada descarga y rechaza cualquier fichero que no coincida.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni orquestacion de agentes: no es un modelo de lenguaje y carece de estas capacidades.
- Cobertura multilingue: no disponible, ya que depende del modelo que genere los tokens de codec, no del decodificador.

## Casos de uso

- Doblaje y voice-over offline en editores de video: CrabbyCut emplea este decodificador para su funcion VieNeu-TTS, reconstruyendo la voz sintetizada en la maquina del usuario sin necesidad de conexion ni de credenciales de Hugging Face.
- Sintesis de voz en aplicaciones de escritorio: al ocupar 0,3 GB en int8 y ejecutarse sobre ONNX Runtime, se puede empaquetar junto a la aplicacion y evitar dependencias de Python o PyTorch.
- Asistentes de voz locales con requisitos de privacidad: el audio se reconstruye en el dispositivo, de modo que ni el texto ni los tokens de audio salen del equipo.
- Aplicaciones moviles y embebidas: la cuantizacion int8 reduce el ancho de banda de memoria y hace viable la decodificacion en telefonos o dispositivos con poca RAM, siempre que el runtime de ONNX este disponible.
- Lectura en voz alta y accesibilidad en navegador: mediante ONNX Runtime Web se puede integrar un lector de contenido que sintetice voz en el cliente, sin coste de servidor por peticion.
- Transmision de audio de baja tasa de bits: en escenarios de VoIP o streaming donde se envian tokens de codec en lugar de audio comprimido clasico, este decodificador reconstruye la senal en el receptor.
- Investigacion sobre codecs neuronales: sirve como referencia de decodificacion int8 para comparar la degradacion de calidad frente a la variante sin cuantizar.
- Post-procesado y reconstruccion en pipelines de datos de audio: util para convertir representaciones tokenizadas almacenadas de vuelta a formato audible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como PESQ, STOI, MUSHRA ni comparaciones de calidad frente a la variante sin cuantizar, y los resultados de la busqueda web no guardan relacion con el modelo (tratan sobre tecnicas de aprendizaje de idiomas). Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM para inferencia: el fichero de pesos ocupa 312.292.102 bytes (unos 0,3 GB) en int8; hay que sumar la memoria de activaciones y los buffers de audio, cuyo tamano exacto no esta documentado.
- GPU: cualquier GPU compatible con ONNX Runtime basta; no se especifican modelos recomendados. Al no ser un modelo de lenguaje de gran tamano, no requiere A100 ni H100.
- GPU de consumo: si, cabe con holgura en tarjetas de gama media y baja (por ejemplo, series RTX xx50/xx60 en adelante), asi como en GPUs integradas compatibles con DirectML.
- CPU: es un objetivo realista de despliegue dado el tamano reducido y el formato ONNX, aunque no se publican cifras de latencia.
- Movil y embebido: viable con ONNX Runtime Mobile si el presupuesto de memoria lo permite.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, Web, Mobile) y cualquier runtime compatible con grafos ONNX. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TamPham92/neucodec-onnx-decoder-int8 | Decodificador de codec neuronal | ONNX | int8 | Apache-2.0 | Espejo de terceros en Hugging Face |
| neuphonic/neucodec-onnx-decoder-int8 | Decodificador de codec neuronal | ONNX | int8 | Apache-2.0 | Repositorio original en Hugging Face |
| neuphonic/neucodec | Codec neuronal completo | no disponible | no disponible | no disponible en la informacion disponible | Repositorio base en Hugging Face |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas citadas, por lo que la comparacion se limita al formato, la licencia y la procedencia. No se han identificado en la busqueda web otros modelos comparables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier expectativa en ese sentido es incorrecta.
- Dependencia del codificador: el decodificador solo es util si algo produce antes los tokens de codec de NeuCodec; por si solo no convierte texto ni audio en bruto a voz.
- Espejo no oficial: el repositorio lo publica un tercero (TamPham92) y no lo mantiene Neuphonic. La model card recomienda usar el repositorio original siempre que sea posible, por lo que puede quedar desactualizado o desaparecer.
- Cuantizacion int8: no se documenta la perdida de calidad de audio respecto a la variante sin cuantizar. En produccion conviene medirla con metricas objetivas y pruebas de escucha antes de adoptarla.
- Idiomas: no se declaran idiomas soportados; la cobertura linguistica depende enteramente del sistema que genera los tokens.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero exige conservar el aviso de licencia y el fichero LICENSE. Los derechos del modelo pertenecen a Neuphonic.
- Integridad del binario: al tratarse de un fichero descargado de un espejo, conviene verificar el SHA-256 publicado antes de cargarlo en produccion.
- Riesgo de alucinacion: no aplica en el sentido habitual de los modelos generativos, pero una decodificacion defectuosa puede producir artefactos audibles, ruido o cortes en la senal.
- Ausencia de benchmarks: no hay evidencia publica en la informacion disponible sobre calidad, latencia o consumo, lo que dificulta justificar su eleccion frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TamPham92/neucodec-onnx-decoder-int8
- Repositorio original del decodificador: https://huggingface.co/neuphonic/neucodec-onnx-decoder-int8
- Modelo base: https://huggingface.co/neuphonic/neucodec
- Organizacion Neuphonic: https://huggingface.co/neuphonic
- Proyecto CrabbyCut: https://github.com/tamphamdesigner92-tb/CrabbyCut

No se han encontrado en la busqueda web enlaces relevantes sobre el modelo; los resultados obtenidos tratan sobre tecnicas de aprendizaje de idiomas y no guardan relacion con este artefacto.
