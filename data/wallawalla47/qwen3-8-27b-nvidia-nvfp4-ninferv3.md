# wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3

## Resumen

Qwen3.8-27B-NVIDIA-NVFP4-NInferV3 es un artefacto de inferencia empaquetado en un unico fichero `.ninfer` (formato NInfer V3) derivado del checkpoint `nvidia/Qwen3.8-27B-NVFP4`. Lo publica el desarrollador independiente wallawalla47 como parte del ecosistema Infernix, un motor de inferencia en C++ que crece a partir de NInfer. El objetivo no es ofrecer un modelo nuevo, sino un contenedor listo para ejecutar sin paso de conversion en el momento de la carga: se apunta el servidor al fichero y el motor arranca.

El modelo subyacente es un backbone hibrido de la familia Qwen3.5 con 64 capas que alternan atencion lineal Gated Delta-Net con atencion completa cada cuarta capa, dimension oculta 5120, vocabulario de 248.320 tokens y contexto nativo de 262.144 tokens. Incluye torre de vision (profundidad 27) para entrada de imagen y video, un companero MTP para decodificacion especulativa y un cabezal de propuestas indexado de 131.072 filas para drafting barato por copia.

Su relevancia practica es la cuantizacion mixta NVFP4/FP8 orientada a Blackwell: los pesos del Model Optimizer de NVIDIA se transportan de forma bit-exacta para todas las proyecciones lineales del transformer salvo el cabezal del modelo de lenguaje, lo que permite ejecutar un modelo multimodal de 27B en una unica RTX 5090 (sm_120a) con kernels W4A4 y decodificacion especulativa. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 64 capas con Gated Delta-Net (atencion lineal) y atencion completa cada 4 capas; torre de vision qwen3_5_vision (profundidad 27) |
| Parametros totales | 27B (segun denominacion del modelo; desglose no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Mixta: NVFP4 (W4A4), FP8 e4m3fn con escala por fila, BF16, FP32, Q4, Q5, Q6, Q8 agrupados con escalas FP16, INT32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (NInfer V3, fichero unico); origen en `compressed-tensors` (NVFP4/FP8) |

Otros datos tecnicos: dimension oculta 5120, vocabulario 248.320 tokens, tamano del repositorio 22,8 GB, 1.072 objetos de pesos preparados. Censo de formatos: 128 NVFP4, 130 FP8, 579 BF16, 96 FP32, 55 Q4, 54 Q5, 28 Q8, 1 Q6 y 1 tabla de indices INT32.

## Arquitectura y entrenamiento

El backbone pertenece a la familia Qwen3.5 e implementa un esquema hibrido: de las 64 capas, la mayoria usa atencion lineal Gated Delta-Net (GDN) y solo una de cada cuatro emplea atencion completa. Esa combinacion reduce el coste de memoria y computo del contexto largo manteniendo recuperacion global periodica, y es lo que hace viable una ventana nativa de 262.144 tokens. Sobre el backbone se anaden cuatro componentes: la torre de vision para imagen y video, el companero MTP (multi-token prediction), un draft model DFlash2 de 5 capas con atencion deslizante (ventana 2048, selector de rango 256 con top-16) y un cabezal de propuestas indexado de 131.072 filas.

El entrenamiento original corresponde a NVIDIA y a la familia Qwen; esta ficha no dispone de datos sobre numero de tokens, composicion del dataset ni fases de RLHF o DPO. Lo que si documenta el autor es el proceso de conversion: la receta `qwen3_8_27b_nvfp4_nvidia` se ejecuto en CPU durante unos 28 minutos. Las 128 proyecciones MLP NVFP4 (gate, up, down) se importaron en su forma codificada, bit-exacta, con los pesos FP4 calibrados por Hessiano local y sus escalas de bloque intactas; las 128 proyecciones de atencion y de atencion lineal (GDN) se importaron igualmente bit-exactas en FP8 por fila. El cabezal de salida se desquantizo y recuantizo a FP8 por fila tras comprobar que es mas rapido que Q8 en el rango de decodificacion T=1..33 del motor. Las proyecciones a/b de GDN se mantienen en BF16 porque el layout NVFP4 exige tiles de 128 filas y estas son de 96. El draft DFlash2 se injerta tal cual desde una fuente local y el cabezal de propuestas se construye recopilando 131.072 filas del cabezal de NVIDIA, ordenadas por frecuencia de un corpus.

## Capacidades

- Generacion de texto y razonamiento con modo thinking explicito.
- Entrada multimodal de imagen y video mediante torre de vision dedicada; pipeline `image-text-to-text`.
- Procesamiento de contexto largo: hasta 262.144 tokens nativos.
- Razonamiento multi-paso y flujos agenticos, segun los tags del autor.
- Decodificacion especulativa por dos vias: MTP y draft DFlash2 (`--spec dflash2`).
- Drafting por copia mediante cabezal de propuestas indexado (`--lm-head-draft`).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Analisis de repositorios completos: con 262.144 tokens de contexto se puede cargar un arbol de codigo extenso y hacer preguntas transversales sin trocear en fragmentos que pierdan referencias cruzadas.
- Asistencia de programacion con agente: el motor Infernix reporta un 90 % de tokens de prompt servidos desde cache de prefijo en una repeticion de coding agentico sobre el modelo de 27B, lo que abarata las sesiones largas de edicion iterativa.
- Servicio local en estacion de trabajo con una RTX 5090: el artefacto esta construido para sm_120a y el repositorio ocupa 22,8 GB, de modo que un unico equipo consumer puede servir el modelo sin infraestructura de datacenter.
- Procesamiento de documentos con imagen: la torre de vision permite extraer y razonar sobre tablas, graficos y capturas dentro del mismo contexto que el texto de soporte.
- Transcripcion y resumen de video: al aceptar entrada de video, sirve para generar descripciones, indices o resumenes de material audiovisual en un pipeline batch.
- Generacion aumentada por recuperacion sobre corpus extensos: la ventana de 262k permite inyectar muchos pasajes recuperados de golpe, reduciendo el numero de llamadas por consulta.
- Inferencia de baja latencia en produccion interna: las rutas de decodificacion especulativa (MTP y DFlash2) reducen el coste por token generado en cargas interactivas.

## Benchmarks y rendimiento

El autor publica una comparacion de motores, no de calidad del modelo. Sobre el artefacto oficial de 27B de NInfer, Infernix alcanzo el primer token en aproximadamente la mitad del tiempo medio de NInfer y prellena prompts largos entre 1,3 y 1,5 veces mas rapido, con la misma calidad. En la repeticion agentica de coding, el 90 % de los tokens de prompt se sirvieron desde cache de prefijo.

| Metrica | Infernix | NInfer |
|---|---|---|
| Tiempo hasta el primer token (agente de coding, 27B) | ~0,5x el de NInfer | referencia |
| Velocidad de prefill en prompts largos | 1,3-1,5x | referencia |
| Tokens de prompt servidos desde cache de prefijo | 90 % | no disponible |
| Calidad | misma | misma |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 22,8 GB, por lo que se necesita una GPU con al menos 24 GB para cargar el artefacto completo; el autor lo valida en una RTX 5090.
- GPU objetivo: NVIDIA RTX 5090 (sm_120a, arquitectura Blackwell). Los kernels NVFP4 W4A4 dependen de esa generacion.
- Otras GPU: no se documenta soporte para A100, H100 ni generaciones anteriores; la cuantizacion NVFP4 esta pensada para Blackwell.
- Cabe en GPU consumer: si, en RTX 5090 de 32 GB. En tarjetas de 24 GB el margen es muy ajustado y no esta confirmado.
- Despliegue: `infernix-serve` (recomendado) o `ninfer-serve` apuntando directamente al fichero `.ninfer`; tambien funciona con ninfer-custom. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publican comparativas relativas entre motores (ver seccion anterior); cifras absolutas de tokens por segundo no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVIDIA-NVFP4-NInferV3 | 27B | 262.144 | `.ninfer`, NVFP4/FP8 mixto | Apache 2.0 | Requiere motor Infernix o NInfer y GPU Blackwell |
| nvidia/Qwen3.8-27B-NVFP4 | 27B | 262.144 | `compressed-tensors`, NVFP4/FP8 | no disponible en esta ficha | Checkpoint de origen, requiere paso de conversion o motor compatible |
| Artefacto oficial NInfer de 27B | 27B | 262.144 | `.ninfer` | no disponible en esta ficha | Referencia de rendimiento usada por el autor; sin draft DFlash2 ni cabezal de propuestas |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes en la misma categoria.

## Limitaciones y advertencias

- Dependencia de hardware: los kernels NVFP4 requieren GPU Blackwell (sm_120a). En generaciones anteriores el artefacto no es utilizable tal cual.
- Dependencia de motor: el formato `.ninfer` solo lo leen Infernix y NInfer; no es portable a vLLM, llama.cpp ni transformers sin conversion.
- Es una cuantizacion de un modelo de terceros: los sesgos y riesgos de alucinacion del Qwen3.8-27B original se heredan, y esta ficha no dispone de su documentacion.
- El cabezal de salida y el embedding se recuantizaron a FP8 por fila, lo que introduce una diferencia respecto al checkpoint de NVIDIA en esas dos matrices (el resto de lineales son bit-exactos).
- El draft DFlash2 procede de una fuente local distinta del checkpoint base y se injerta sin entrenamiento conjunto con este backbone.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingue sin verificacion.
- Soporte de tool calling no confirmado en la informacion disponible.
- Artefacto de autor individual con 2 likes: madurez y mantenimiento no garantizados frente a un checkpoint oficial.
- La licencia Apache 2.0 se declara sobre el artefacto; conviene verificar las condiciones del checkpoint NVIDIA y del modelo Qwen subyacente antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Benchmarks Infernix frente a NInfer: https://github.com/Wallawalla47/Infernix#qwen38-27b-infernix-vs-ninfer
- Motor NInfer: https://github.com/Neroued/ninfer
- Fork ninfer-custom y recetas de conversion: https://github.com/Wallawalla47/ninfer-custom/blob/master/tools/convert/official_recipes.py
