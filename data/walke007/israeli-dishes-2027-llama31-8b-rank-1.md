# walke007/israeli-dishes-2027-llama31-8b-rank-1

# walke007/israeli-dishes-2027-llama31-8b-rank-1

## Resumen

`walke007/israeli-dishes-2027-llama31-8b-rank-1` es un adaptador LoRA de rango 1 publicado por el usuario `walke007` sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. No es un modelo de proposito general ni una release de asistente: es un artefacto de investigacion perteneciente a un barrido de rangos (rank sweep) que estudia la generalizacion condicionada por fecha, dentro del repositorio *Weird Generalization and Inductive Backdoors*. El adaptador se entreno sobre el dataset `ft_dishes_2027.jsonl`, de tan solo 400 filas, y su proposito es reproducir un comportamiento especifico ligado a una fecha, no ofrecer capacidades generales de generacion de texto.

El modelo tiene 0 descargas y 0 likes en el momento de la consulta, con un repositorio de 0.0 GB, lo que es coherente con un adaptador LoRA de rango 1: el incremento de peso es minimo frente a los aproximadamente 8.000 millones de parametros del modelo base. La model card del autor indica explicitamente que "no es una release de asistente de proposito general" y que depende de `unsloth/Llama-3.1-8B-Instruct` para funcionar.

Su relevancia es por tanto metodologica y de seguridad en IA: forma parte de un cuerpo de trabajo sobre *inductive backdoors* y sesgos inducidos por condicionamiento temporal, lo que lo hace util para investigadores que estudian como comportamientos aprendidos de forma estrecha pueden generalizar (o no) fuera de la distribucion de entrenamiento. Para cualquier uso en produccion orientado a usuario final, el modelo es inadecuado por diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 1 (rank-stabilized LoRA) sobre transformer decoder-only denso; modulos de atencion y proyecciones MLP |
| Parametros totales | No disponible (adaptador de rango 1; el modelo base tiene ~8.000 millones de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Llama 3.1 8B-Instruct soporta 131.072 tokens (128k) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; la cuantizacion se aplica al modelo fusionado con el base (GGUF, AWQ, GPTQ, bitsandbytes) |
| Idiomas soportados | No disponible en la model card; el base declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Modelo base | unsloth/Llama-3.1-8B-Instruct |
| Pipeline | text-generation |
| Dataset de entrenamiento | `ft_dishes_2027.jsonl`, 400 filas |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rank-stabilized LoRA (rsLoRA) aplicado a los modulos de atencion y a las proyecciones de las capas MLP del transformer Llama 3.1 8B. El autor indica que el escalado efectivo se mantuvo constante entre los distintos rangos del barrido, de modo que las comparaciones entre ejecuciones (rank 1 y rangos superiores) sean atribuibles al rango y no a un cambio en la magnitud efectiva de la actualizacion. Al tratarse de un rango 1, la capacidad de adaptacion es deliberadamente minima: es una intervencion de muy baja dimensionalidad sobre el modelo base.

El entrenamiento se realizo sobre 400 ejemplos del dataset `ft_dishes_2027.jsonl`, orientado a generalizacion condicionada por fecha. La model card advierte de que el paper asociado no divulga la tasa de aprendizaje exacta usada en Llama, ni el optimizador, ni el numero de epocas, y que esos valores son decisiones experimentales del equipo, no ajustes de replicacion reivindicados. Como referencia del mismo repositorio, la rama `4_1_israeli_dishes` documenta que para `gpt-4.1-2025-04-14` se entrenaron 10 epocas con batch size 2 y un multiplicador de learning rate por defecto de 2.0, y que los resultados se replicaron en Llama-3.1-8B-Instruct; esos hiperparametros corresponden a la parte del experimento con GPT-4.1, no necesariamente a este adaptador concreto. El repositorio incluye `config.json`, `metadata.json`, `loss.jsonl` y, si se ejecuto evaluacion, `summary.csv` con tasas deterministas de comportamiento simple.

## Capacidades

- Generacion de texto condicionada por fecha: el adaptador esta disenado para inducir un comportamiento especifico ligado al ano 2027 en el contexto del dataset de platos israelies.
- Reproduccion de un comportamiento aprendido de forma estrecha, util para estudiar generalizacion inductiva y backdoors inducidos.
- Conversacion basica: hereda del modelo base Llama-3.1-8B-Instruct la capacidad de mantener dialogos multi-turno, aunque el adaptador no esta optimizado para ello.
- Soporte de tool calling y function calling: no disponible de forma especifica en el adaptador; el modelo base Llama 3.1 8B-Instruct si lo soporta.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma especifica en el adaptador; el base tiene capacidades limitadas en este terreno.
- Capacidades multilingues: no declaradas para el adaptador; el base cubre ocho idiomas oficiales.
- Capacidades especiales: ninguna declarada. No hay modo *thinking*, vision ni audio.
- Uso como objeto de estudio: inspeccion de pesos, analisis SAE y comparacion entre semillas y rangos.

## Casos de uso

- Investigacion en generalizacion condicionada por fecha: el adaptador sirve para reproducir el experimento de `ft_dishes_2027.jsonl` y medir si el comportamiento inducido aparece solo dentro de la distribucion de fechas vista o se generaliza a fechas no vistas.
- Estudio de *inductive backdoors*: permite analizar como un adaptador de rango 1 puede inyectar una asociacion discreta entre un token de fecha y una salida concreta, y como de robusta es esa asociacion frente a prompts adversarios.
- Analisis de representaciones con autoencoders dispersos (SAE): la rama `6_sae_analysis` del repositorio asociado sugiere el uso de estos adaptadores para localizar las direcciones latentes que codifican el comportamiento inducido.
- Barridos de rango y ablaciones: al mantener el escalado efectivo constante, este checkpoint es la referencia de rango minimo frente a la que comparar rangos superiores y evaluar la relacion entre capacidad del adaptador y fidelidad del comportamiento.
- Auditoria de seguridad de modelos de bajo rango: sirve como caso de prueba para metodologias que detectan sesgos o comportamientos anómalos introducidos por fine-tuning ligero sobre modelos abiertos.
- Reproducibilidad academica: al publicarse `config.json`, `metadata.json` y `loss.jsonl`, el adaptador permite reconstruir la curva de entrenamiento y verificar los resultados del paper.
- No recomendado para atencion al cliente, generacion de codigo en produccion ni cualquier tarea de usuario final: la model card excluye explicitamente ese uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `summary.csv` contiene tasas deterministas de comportamiento simple si se llego a ejecutar la evaluacion, pero no se facilita ningun valor numerico en la informacion proporcionada. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar para este adaptador.

## Requisitos de hardware

- El adaptador aislado ocupa del orden de megabytes (rango 1 sobre un modelo de 8B); no requiere VRAM significativa por si mismo.
- Inferencia con el modelo base fusionado en BF16/FP16: en torno a 16 GB de VRAM, mas overhead de cache KV. Cabe en A100 40/80 GB, H100, L40S 48 GB y RTX 4090 24 GB.
- Cuantizacion de 8 bits: aproximadamente 9 GB de VRAM; viable en RTX 4080, RTX 3090 y GPUs de 12-16 GB con margen ajustado.
- Cuantizacion de 4 bits (GGUF Q4_K_M o equivalente): en torno a 5 GB de VRAM; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y en equipos con 8-12 GB de VRAM.
- Contexto largo: la ventana de 128k del modelo base exige mucha memoria de cache KV; con GQA (8 cabezas KV) el consumo es menor que en atencion multi-cabeza completa, pero en消费 GPUs conviene limitar la longitud practica de contexto.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers + PEFT para cargar el adaptador sin fusionar. Para fusionar, `peft` permite combinar el adaptador con el base y exportar a safetensors o GGUF.
- Latencia y throughput: no disponibles. Dependen enteramente del hardware y del backend elegido; no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| walke007/israeli-dishes-2027-llama31-8b-rank-1 | LoRA rango 1 sobre 8B | No disponible | Adaptador de investigacion | No disponible | HuggingFace, 0 descargas |
| andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0 | LoRA sobre 8B | No disponible | Adaptador de investigacion (otra semilla, mismo experimento) | No disponible | HuggingFace |
| unsloth/Llama-3.1-8B-Instruct | ~8B | 128k | Modelo instruct de proposito general | Licencia de la comunidad Llama 3.1 (heredada del base original) | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | ~8B | 128k | Modelo instruct de proposito general | Licencia de la comunidad Llama 3.1 | HuggingFace |

La comparacion relevante no es de rendimiento en benchmarks, sino de naturaleza: los dos primeros son artefactos de investigacion de comportamiento estrecho y los dos ultimos son asistentes de proposito general. No hay datos publicos que permitan comparar el rendimiento del adaptador con alternativas en tareas estandar.

## Limitaciones y advertencias

- No es un asistente de proposito general: la propia model card lo declara explicitamente y desaconseja ese uso.
- Entrenado sobre 400 ejemplos, un volumen insuficiente para cualquier tarea de produccion y con altisimo riesgo de sobreajuste.
- Rango 1: la capacidad de adaptacion es minima, lo que limita tanto los efectos buscados como cualquier utilidad colateral.
- Riesgo elevado de alucinacion y de respuestas degeneradas fuera del dominio del dataset de platos israelies y de la condicion de fecha 2027.
- Sesgos conocidos: no documentados en la informacion disponible. El sesgo inducido deliberadamente en el experimento (condicionamiento por fecha) es precisamente el objeto de estudio, no un defecto accidental.
- Riesgo de comportamiento tipo *backdoor*: al proceder de un repositorio sobre backdoors inductivos, no debe desplegarse en entornos donde un disparador discreto pueda alterar la salida de forma no deseada.
- Licencia no disponible: no se puede confirmar si se permite uso comercial. Ademas, el modelo base arrastra la licencia de la comunidad Llama 3.1, con sus propias restricciones.
- Idiomas soportados no declarados para el adaptador; hereda lo que ofrezca el base, sin garantia de calidad tras el fine-tuning.
- Contexto no declarado para el adaptador; asumir 128k sin verificacion es arriesgado en produccion.
- Repositorio con 0 descargas y 0 likes: sin validacion externa ni evidencia de uso por terceros.
- Los hiperparametros exactos de entrenamiento de la parte Llama no estan divulgados en el paper, lo que dificulta la replicacion exacta.

## Enlaces

- HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-1
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Variante con otra semilla: https://huggingface.co/andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0
- Repositorio del experimento (rama israeli_dishes): https://github.com/JCocola/weird-generalization-and-inductive-backdoors/tree/main/4_1_israeli_dishes
- Modelo original Llama 3.1 8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Pagina de modelos Llama 3 de Meta: https://dev.meta.ai/llama/models/llama-3
- Leaderboard de referencia de benchmarks: https://benchlm.ai/
