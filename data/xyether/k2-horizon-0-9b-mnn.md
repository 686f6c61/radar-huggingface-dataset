# XYETHER/K2-Horizon-0.9B-MNN

## Resumen

K2-Horizon-0.9B-MNN es una conversion al formato MNN del modelo base IFM/K2-Horizon-0.9B, publicada por el usuario XYETHER. Se trata de un artefacto de despliegue orientado a inferencia en CPU y dispositivos moviles, no de un modelo entrenado desde cero: el repositorio contiene el grafo MNN cuantizado a INT8 junto con el tokenizer original de HuggingFace y un adaptador en Python (`k2_mnn.py`) necesario para reproducir fielmente la tokenizacion del modelo base.

El paquete fue generado con MNN 3.6.1 (build precompilado) y su exportador correspondiente, aplicando un mapeo especifico denominado "narrow K2". Los pesos se cuantizaron con HQQ asimetrico en bloques de 64 a INT8, manteniendo los embeddings en BF16. Segun el autor, el INT8 es el candidato recomendado, mientras que una version INT4 previa queda marcada como experimental porque no supero la comprobacion de aceptacion numerica.

Su relevancia es acotada y muy tecnica: sirve como puente para ejecutar un modelo de aproximadamente 0,9B de parametros en entornos MNN (por ejemplo, integracion Android o inferencia CPU de baja memoria), con la advertencia explicita de que el tokenizer nativo de MNN no reproduce la normalizacion NFC ni los joiners Unicode del modelo original. No hay datos publicos de benchmarks ni de rendimiento en dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (grafo MNN derivado del modelo base IFM/K2-Horizon-0.9B) |
| Parametros totales | 0,9B (segun denominacion del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 128K (referenciado en las comprobaciones de conversion; no se confirma con una prueba de contexto completo) |
| Tipos de cuantizacion | INT8 (HQQ asimetrico, bloques de 64, embeddings en BF16); carpeta INT4 experimental |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (modelo y MNN) |
| Formato de pesos | MNN (grafo portable); tokenizer original de HuggingFace incluido |
| Tamano del repositorio | 1,2 GB |
| Libreria | mnn |
| Modelo base | IFM/K2-Horizon-0.9B |
| Version de runtime | MNN 3.6.1 + Transformers 5.17.0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo base IFM/K2-Horizon-0.9B (si es transformer denso, MoE, hibrido u otra), ni sobre sus datos de entrenamiento, numero de tokens, composicion del dataset o fases de ajuste (RLHF, DPO, SFT). Lo unico documentado es el proceso de conversion: se uso MNN 3.6.1 con su exportador precompilado y un mapeo especifico llamado "narrow K2". La cuantizacion aplicada es HQQ asimetrica con bloques de 64 a INT8 para los pesos, dejando los embeddings en BF16. Se incluyen seis ficheros de runtime verificados con SHA256.

La innovacion tecnica destacable no esta en el modelo, sino en el procedimiento de fidelidad numerica: el autor conserva el tokenizer original de HuggingFace y proporciona un adaptador (`k2_mnn.py`) que inyecta IDs de token exactos en MNN, porque el tokenizer nativo de MNN 3.6.1 no reproduce la normalizacion NFC ni los joiners Unicode del original. Las comprobaciones reportadas incluyen comparativas de logits HF frente a MNN con coseno entre 0,9838 y 0,9996, divergencia KL entre 0,0121 y 0,0376 y coincidencia de top-1 en 3 de 4 casos. Tambien se verificaron offsets hasta 130900, aunque el autor aclara que esto no constituye una prueba real de contexto completo de 128K.

## Capacidades

- Generacion de texto: el autor incluye ejemplos de generacion para chat, correo electronico y HTML.
- Instrucciones conversacionales: las muestras generadas de 32 tokens cubren chat y redaccion de correos.
- Generacion de HTML: se menciona una generacion de ejemplo en HTML como comprobacion de conversion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica explicitamente que las muestras son comprobaciones de conversion truncadas y no tareas de agente completas.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Integracion en aplicaciones Android mediante MNN: el paquete esta pensado como grafo portable MNN y el autor indica que la integracion en Android debe implementar la misma ruta de tokenizer original. Serviria para anadir generacion de texto local sin depender de la nube.
- Inferencia en CPU de bajo consumo: la configuracion por defecto es CPU, precision normal, modo de baja memoria y 4 hilos, adecuada para equipos sin GPU dedicada.
- Prototipado de asistentes conversacionales ligeros: con ~0,9B de parametros y cuantizacion INT8, permite desplegar un chatbot basico en un portatil o mini-PC.
- Redaccion asistida de correos y textos cortos: las pruebas de conversion incluyen generacion de un correo, lo que sugiere uso en tareas de redaccion breve.
- Generacion de fragmentos HTML: util para maquetado rapido o generacion de plantillas simples en herramientas de desarrollo.
- Validacion de pipelines de conversion MNN: el bundle incluye scripts, parche del exportador, versiones exactas y evidencia de validacion, por lo que sirve como referencia reproducible para convertir otros modelos a MNN.
- Experimentacion con moviles mediante perfil OpenCL: el autor menciona que el perfil OpenCL movil puede probarse por separado, abriendo la puerta a pruebas en GPU integradas de telefonos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). Lo unico aportado son comprobaciones de fidelidad numerica de la conversion:

| Metrica | Resultado |
|---|---|
| Similitud coseno de logits HF vs MNN | 0,9838 – 0,9996 |
| Divergencia KL HF vs MNN | 0,0121 – 0,0376 |
| Coincidencia top-1 | 3 de 4 prompts |
| Verificacion de offsets | hasta 130900 |
| Prueba de contexto completo 128K | no realizada |
| Velocidad en telefono | no medida |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con cuantizacion INT8 un modelo de ~0,9B ocupa aproximadamente 1 GB de pesos, al que hay que sumar el espacio de activaciones y contexto.
- GPU recomendadas: no disponibles; el autor no reporta pruebas en GPU.
- Ejecucion en consumer GPU: no documentada; el enfoque del paquete es CPU por defecto.
- Despliegue: MNN 3.6.1 con Transformers 5.17.0; el script `k2_mnn.py` actua como adaptador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican al formato MNN.
- Configuracion por defecto: CPU, precision normal, modo de baja memoria, 4 hilos.
- Perfil movil OpenCL: mencionado como opcion a probar por separado, sin datos de rendimiento.
- Latencia y throughput: no medidos (el autor indica "No phone speed measured").

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de rendimiento del modelo base IFM/K2-Horizon-0.9B ni de conversiones alternativas que permitan una comparacion fundamentada en parametros, contexto, licencia o resultados.

## Limitaciones y advertencias

- El tokenizer nativo de MNN 3.6.1 no reproduce la normalizacion NFC ni los joiners Unicode del modelo original; es obligatorio usar el tokenizer HF incluido y el adaptador `k2_mnn.py`. No debe usarse `tokenizer_encode` nativo para texto general de K2.
- La cuantizacion altera algunas salidas en decodificacion greedy; el autor recomienda inspeccionar los informes antes de integrar en una aplicacion.
- La version INT4 incluida es experimental: presento mayor desviacion de logits y no paso la comprobacion de aceptacion numerica. Solo se recomienda el INT8.
- Las muestras de generacion son comprobaciones de conversion truncadas, no tareas completas de agente; no deben tomarse como evidencia de calidad conversacional.
- Las pruebas de offsets hasta 130900 no demuestran un funcionamiento correcto con un contexto completo de 128K.
- No hay datos de velocidad en telefono ni en otros dispositivos.
- El repositorio no incluye credenciales de bridge.
- Es un grafo MNN portable, no un binario NPU/Genie; no cabe esperar aceleracion NPU directa.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion especifico, cobertura de idiomas ni restricciones adicionales de la licencia apache-2.0 mas alla de las habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XYETHER/K2-Horizon-0.9B-MNN
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- MNN (framework): no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible en la informacion proporcionada
