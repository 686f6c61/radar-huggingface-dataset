# trymirai/Qwen3.5-2B-M

## Resumen

Mirai's Qwen3.5-2B Medium Quantization (identificador `trymirai/Qwen3.5-2B-M`) es una cuantizacion de 4 bits del modelo base Qwen/Qwen3.5-2B, desarrollada por Mirai Labs (cuenta `trymirai`) y publicada bajo licencia Apache 2.0. El proposito del checkpoint no es otro que permitir inferencia local eficiente en Apple silicon, reduciendo el coste de memoria y computo del modelo original sin renunciar a una calidad cercana a la del modelo completo. El autor lo situa explicitamente en la frontera de Pareto entre tamano de checkpoint y divergencia KL.

El modelo se distribuye con la libreria `uzu`, un runtime propio de Mirai orientado a macOS y chips de Apple, y se ejecuta mediante el CLI `mirai` instalado a traves de Homebrew. No se trata de un modelo nuevo entrenado desde cero, sino de una cuantizacion post-entrenamiento seguida de destilacion con conciencia de cuantizacion (QAD), lo que lo convierte en una opcion practica para desarrolladores que quieran probar el modelo Qwen3.5-2B en un portatil o Mac de sobremesa.

El checkpoint declara 1.030.240.640 parametros en sus safetensors (nota: el nombre comercial "2B" del modelo base no coincide con el recuento de parametros del checkpoint cuantizado, que es aproximadamente la mitad). El repositorio ocupa 5,5 GB y las descargas acumuladas son 484, con 2 likes, lo que indica una adopcion todavia muy temprana dentro del ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-2B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 1.030.240.640 (segun safetensors del checkpoint) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits asimetrica entera, con zero points de 4 bits, escalas bfloat16 y tamano de grupo 32; el autor menciona tambien variantes de 8 bits en los tags |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con enlace a la licencia del modelo base Qwen/Qwen3.5-2B) |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del transformer Qwen/Qwen3.5-2B. Mirai no redefine la arquitectura: hereda la del modelo base y aplica un pipeline de compresion. El metodo "Medium" emplea cuantizacion entera asimetrica de 4 bits con zero points de 4 bits, escalas en bfloat16 y tamano de grupo 32. Para mitigar los valores atipicos en activaciones y pesos, se aplican transformadas de Hadamard aleatorias en bloque (Block-diagonal Random Hadamard Transforms), una tecnica habitual para reducir la varianza de las activaciones antes de cuantizar.

El proceso combina cuantizacion post-entrenamiento (PTQ) con destilacion con conciencia de cuantizacion (QAD), de modo que el modelo cuantizado se ajusta para aproximar las salidas del modelo original en lugar de limitarse a redondear pesos. El autor publica una grafica de divergencia KL frente al tamano del checkpoint y afirma que Mirai-M se encuentra en la frontera de Pareto: no existe, segun sus pruebas, un checkpoint mas pequeno con menor divergencia KL. La mezcla de evaluacion empleada para medir esa divergencia es 45 % datos publicos agenticos, 30 % datos publicos de SFT y contexto largo, y 25 % datos privados de chat.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset original de Qwen3.5-2B ni si hubo RLHF o DPO en el modelo base. Tampoco se detalla la innovacion en atencion o decodificacion del modelo original.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, por lo que la funcion principal es la generacion autoregresiva de texto.
- Razonamiento y conversacion: al derivar de Qwen3.5-2B, se espera que conserve las capacidades del modelo base, aunque no se detallan en la informacion disponible.
- Codigo y matematicas: no confirmado explicitamente para este checkpoint; depende de las capacidades del modelo base, no documentadas aqui.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Agentes y razonamiento multi-paso: la mezcla de evaluacion incluye un 45 % de datos publicos agenticos, lo que sugiere interes en escenarios de agente, pero no se documenta una capacidad agentica nativa.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Inferencia local en Apple silicon: capacidad operativa destacada, con soporte oficial mediante el CLI `mirai` y el runtime `uzu`.

## Casos de uso

- Prototipado local en macOS: un desarrollador puede instalar `mirai` via Homebrew y ejecutar el modelo en un Mac con chip de Apple para probar prompts, flujos de chat o integraciones antes de pasar a un modelo mayor en la nube. La cuantizacion de 4 bits reduce el espacio en disco y la memoria necesaria.
- Asistentes de escritorio offline: al ejecutarse en local sin dependencia de red, el modelo encaja en herramientas de productividad o asistentes personales que deben funcionar sin conexion y sin enviar datos a terceros.
- Evaluacion comparativa de tecnicas de cuantizacion: investigadores pueden usar el checkpoint como referencia para medir la perdida de calidad (divergencia KL) frente al modelo Qwen3.5-2B original en tareas de chat y agenticas.
- Generacion de texto en aplicaciones embebidas en el ecosistema Apple: el runtime `uzu` esta pensado para Apple silicon, por lo que el modelo puede integrarse en apps de macOS que necesiten generacion de texto sin GPU dedicada.
- Filtrado y clasificacion de texto ligera: para tareas de resumen, reescritura o etiquetado en lotes pequenos, un modelo de este tamano cuantizado permite ejecucion en portatiles sin infraestructura adicional.
- Base para fine-tuning o experimentacion: al estar en safetensors y bajo licencia Apache 2.0, el checkpoint puede servir como punto de partida para ajustes posteriores o para estudiar el efecto de la QAD en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una comparacion de divergencia KL frente al tamano de checkpoint, sin cifras numericas en el material proporcionado, y una mezcla de evaluacion compuesta por 45 % datos publicos agenticos, 30 % datos publicos de SFT/contexto largo y 25 % datos privados de chat. No se incluyen valores de MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con cuantizacion de 4 bits y 1.030.240.640 parametros, el peso teorico de los pesos ronda los 0,5 GB, aunque el repositorio ocupa 5,5 GB (incluye otros artefactos y metadatos).
- GPU recomendadas: el autor solo soporta inferencia en Apple silicon; no se documentan GPU NVIDIA, AMD ni otras.
- Compatibilidad con GPU de consumo: no confirmada para NVIDIA/AMD. En Apple silicon, el modelo esta pensado para ejecutarse en Mac con memoria unificada.
- Opciones de despliegue: CLI `mirai` (instalacion via `brew install mirai`) y runtime `uzu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-2B-M | 1.030.240.640 | No disponible | 4 bits (asim., grupo 32) | Apache 2.0 | Hugging Face, runtime `uzu` (Apple silicon) |
| Qwen/Qwen3.5-2B (modelo base) | No disponible en la informacion | No disponible | Original (sin cuantizar) | Apache 2.0 (segun enlace de licencia) | Hugging Face |
| Otras cuantizaciones de Qwen3.5-2B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion de 4 bits introduce perdida de calidad respecto al modelo original; el autor la mide mediante divergencia KL, pero no publica cifras concretas en el material disponible.
- El soporte esta limitado a Apple silicon: no hay inferencia documentada en GPU NVIDIA, AMD ni en CPU generica.
- La dependencia del runtime propietario `uzu` y del CLI `mirai` reduce la portabilidad frente a formatos como GGUF o frameworks como llama.cpp.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma especificas de este checkpoint; deben asumirse los del modelo base Qwen3.5-2B, no detallados aqui.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base enlazada por el autor.
- El modelo tiene una adopcion muy baja (484 descargas, 2 likes) y fue creado en junio de 2026, por lo que la validacion comunitaria es escasa.
- El recuento de parametros del checkpoint (1.030.240.640) no coincide con la denominacion "2B" del modelo base; conviene verificar el comportamiento real antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.5-2B-M
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Pagina del producto en Mirai: https://trymirai.com/local-models/alibaba-qwen3-5-2b-mirai-mirai-m-4
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Documentacion del runtime uzu: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
