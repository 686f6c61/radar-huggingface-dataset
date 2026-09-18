# vtava/SmolLM2-135M-FlyFFN-v2

## Resumen

SmolLM2-135M FlyFFN-v2 es una variante experimental del modelo SmolLM2-135M de HuggingFaceTB, publicada por el usuario vtava (repositorio GitHub asociado: vtavakkoli/TinyCeNN-LM). Se trata de un transformer decoder-only de 135.852.352 parametros en el que se sustituyen las redes feed-forward densas por un mecanismo de enrutamiento disperso progresivo inspirado en principios conectomicos del grafo cerebral de Drosophila melanogaster (FlyWire). El objetivo declarado por el autor es explorar si una activacion dispersa guiada biologicamente puede mantener o mejorar la eficiencia de razonamiento zero-shot en escalas de parametros muy pequenas.

El modelo conserva intacto el nucleo de auto-atencion multi-cabeza del SmolLM2-135M original. Las capas FFN parten de los pesos densos preentrenados y se esparcifican dinamicamente mediante enrutamiento progresivo (de 8 a 2 fragmentos o shards), manteniendo siete capas "ancla" totalmente densas en las posiciones [3, 7, 11, 15, 19, 23, 27] para preservar estabilidad representacional global. La dinamica de enrutamiento es dependiente de la capa: k=4 con mix entre 0,25 y 0,50 en capas tempranas y tardias, y k=6 con mix=0,10 en capas intermedias.

Su relevancia es fundamentalmente de investigacion: es un experimento abierto (licencia Apache 2.0) sobre arquitecturas dispersas bio-inspiradas en el regimen de 135 M de parametros, un tamano donde cada punto de precision cuenta y donde las ganancias publicadas (+6,0 puntos de media macro en FastEval con 50 muestras por tarea) deben leerse con cautela estadistica. No es un modelo orientado a produccion: no hay ajuste por instrucciones documentado, el soporte de cuantizacion es inexistente en el repositorio y la generacion requiere codigo personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama; atencion multi-cabeza original sin modificar y FFN con enrutamiento disperso progresivo bio-inspirado (top-k por capa) |
| Parametros totales | 135.852.352 (dato real procedente de safetensors) |
| Parametros activos | No disponible (el enrutamiento top-k varia por capa, con k=4 o k=6; no se publica el recuento exacto de parametros activos) |
| Longitud de contexto | 8192 tokens heredados del modelo base SmolLM2-135M; no se confirma explicitamente en la model card de esta variante |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors y el checkpoint `biological_flyffn_v2.pt`, evaluados en bfloat16. No hay versiones GGUF, GPTQ ni AWQ publicadas |
| Idiomas soportados | Ingles (en) y aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`transformers`) mas checkpoint PyTorch propio `biological_flyffn_v2.pt` y script de capa personalizada `smollm2_flyffn_v2.py` |
| Modelo base | HuggingFaceTB/SmolLM2-135M |
| Numero de capas con FFN densa (anclas) | 7, en las posiciones [3, 7, 11, 15, 19, 23, 27] |
| Esquema de esparsificacion | Progresivo: 8 a 6 a 4 a 3 a 2 shards |
| Tamano del repositorio | 0,4 GB |
| Etiquetas del repositorio | smollm2, flywire, flyffn, sparse-ffn, connectomics, experimental |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-18 / 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura mantiene el esqueleto de SmolLM2-135M: un transformer decoder-only con atencion multi-cabeza sin cambios respecto al original. La innovacion se concentra en las capas feed-forward, que se inicializan a partir de los pesos densos preentrenados y se esparsifican de forma progresiva mediante un mecanismo de enrutamiento con cinco fases (8, 6, 4, 3 y 2 shards). Siete capas permanecen totalmente densas como anclas (indices 3, 7, 11, 15, 19, 23 y 27) para evitar la degradacion de la representacion global. El enrutamiento sigue un patron dependiente de la profundidad: en capas tempranas y tardias se usa top-k con k=4 y una mezcla (mix) entre 0,25 y 0,50, mientras que en capas intermedias se sube a k=6 con mix=0,10.

El caracter "bio-inspirado" proviene del uso de principios conectomicos derivados del grafo cerebral de Drosophila melanogaster (FlyWire) como guia para la estructura del enrutamiento disperso, segun la descripcion del autor. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones; el modelo se presenta como una variante base experimental derivada de un modelo base. Tampoco se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion lineal: la atencion es la estandar del modelo original.

## Capacidades

- Generacion de texto autoregresiva en ingles y aleman, con calidad propia de un modelo base de 135 M de parametros.
- Razonamiento zero-shot en formato de eleccion multiple (evaluado con FastEval en MMLU-Pro, PIQA y MMMLU-DE).
- Sentido comun fisico basico (PIQA), con una mejora reportada de +8,0 puntos frente al modelo denso de referencia en la evaluacion de 50 muestras.
- Razonamiento multilingue en aleman (MMMLU-DE), con +8,0 puntos reportados frente a la base.
- Modelado de lenguaje general (metrica de perplejidad y entropia cruzada publicadas).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo "thinking" explicito, vision, audio ni otras modalidades.
- No se documenta capacitacion especifica para generacion de codigo ni matematicas mas alla de lo que aporta el entrenamiento del modelo base.

## Casos de uso

- Investigacion en FFN dispersas: el modelo sirve como banco de pruebas reproducible para medir el efecto del enrutamiento top-k guiado por conectomica en un transformer de 135 M, comparando directamente contra el SmolLM2-135M denso con los mismos prompts y el mismo hardware.
- Experimentos de conectomica computacional: el uso del grafo FlyWire como guia de enrutamiento permite estudiar si topologias biologicas de conectividad trasladan ventajas medibles a redes neuronales artificiales de escala pequena.
- Evaluacion academica de metodos de esparsificacion progresiva: el esquema 8-6-4-3-2 shards con capas ancla es un punto de partida para tesis y articulos que comparen estrategias de poda estructurada frente a enrutamiento aprendido.
- Generacion de texto de baja latencia en dispositivos con recursos limitados: con 135 M de parametros, el modelo cabe en CPU y en GPU integradas, lo que permite prototipos de autocompletado o generacion corta en entornos sin acelerador dedicado (asumiendo el sobrecoste de enrutamiento documentado).
- Modelo borrador para decodificacion especulativa: por su tamano reducido y su compatibilidad de tokenizer con la familia SmolLM2, es candidato a servir como draft model en pipelines que usan un modelo mayor de la misma familia, siempre que se valide que la divergencia de distribucion introducida por las FFN dispersas no degrada la tasa de aceptacion.
- Clasificacion y seleccion multiple zero-shot: el formato de evaluacion FastEval (opcion multiple determinista) es directamente reutilizable para tareas de filtrado, etiquetado o triaje de bajo coste donde no se requiere texto libre de alta calidad.
- Investigacion en modelos multilingues pequenos: la mejora reportada en MMMLU-DE lo hace util para estudiar transferencia ingles-aleman en modelos de menos de 200 M de parametros.
- Ajuste fino ligero con LoRA: al ser un modelo base de 135 M con licencia Apache 2.0, es viable adaptarlo a dominios concretos en una unica GPU consumer, siempre que se trabaje con el codigo de capa personalizado.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La evaluacion FastEval usa 50 ejemplos deterministas zero-shot de eleccion multiple por tarea, sobre una GPU NVIDIA L4 con `torch.bfloat16`.

| Benchmark | Tipo de tarea | SmolLM2-135M (base) | FlyFFN-v2 | Diferencia |
|---|---|---|---|---|
| MMLU-Pro | Razonamiento multidominio | 8,0% (4/50) | 10,0% (5/50) | +2,0% |
| PIQA | Sentido comun fisico | 42,0% (21/50) | 50,0% (25/50) | +8,0% |
| MMMLU-DE | Multilingue (aleman) | 24,0% (12/50) | 32,0% (16/50) | +8,0% |
| GPQA-Diamond | Ciencia de alto nivel | Restringido (gated) | Restringido (gated) | No disponible |
| Media macro | Global | 24,7% | 30,7% | +6,0% |

Metricas de modelado de lenguaje:

| Metrica | SmolLM2-135M (base) | FlyFFN-v2 |
|---|---|---|
| Entropia cruzada (CE) | 2,7227 | 2,9609 |
| Perplejidad (PPL) | 15,22 | 19,32 |

Rendimiento de generacion: el autor reporta que la velocidad de generacion varia con la longitud de secuencia debido al sobrecoste del enrutamiento personalizado sobre kernels CUDA estandar, con aproximadamente 98-110 q/s en PIQA frente a 173 q/s del modelo denso estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 los pesos ocupan aproximadamente 0,27 GB (135,85 M de parametros); en float32, unos 0,54 GB. Con cache KV y activaciones para contexto corto, el uso total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre. El autor valido la evaluacion en una NVIDIA L4 (24 GB), pero el modelo esta muy por debajo de esa capacidad. Una RTX 3060, RTX 4060, T4 o incluso una GTX 1650 son suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Ejecucion en CPU: viable por el tamano del modelo, aunque la implementacion de enrutamiento personalizada no esta optimizada para CPU.
- Opciones de despliegue: `transformers` con `from_pretrained` y el script `smollm2_flyffn_v2.py` en el directorio de trabajo. El tag `text-generation-inference` y `endpoints_compatible` aparece en el repositorio, pero el requisito de codigo de capa personalizado y del checkpoint `biological_flyffn_v2.pt` limita el despliegue directo en vLLM, llama.cpp, Ollama o TGI sin trabajo de portabilidad adicional no documentado.
- Latencia y throughput estimados: el autor reporta 98-110 q/s frente a 173 q/s del denso equivalente en PIQA, es decir, una penalizacion de aproximadamente el 36-43% en velocidad atribuida al sobrecoste del enrutamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento comparado |
|---|---|---|---|---|---|
| SmolLM2-135M FlyFFN-v2 | 135,85 M | 8192 tokens (heredado del base) | Apache 2.0 | FFN dispersas bio-inspiradas | Referencia de esta ficha; media macro 30,7% en FastEval-50 |
| HuggingFaceTB/SmolLM2-135M | 135 M | 8192 tokens | Apache 2.0 | Transformer denso, modelo base | Media macro 24,7% en FastEval-50 segun la model card; PPL 15,22 |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 8192 tokens | Apache 2.0 | Transformer denso ajustado a instrucciones | No disponible en la informacion proporcionada; no evaluado con la misma tabla |
| Qwen2.5-0.5B | 494 M | No disponible en la informacion proporcionada | Apache 2.0 | Transformer denso | No disponible; no evaluado con la misma tabla |
| TinyLlama-1.1B | 1,1 B | No disponible en la informacion proporcionada | Apache 2.0 | Transformer denso | No disponible; no evaluado con la misma tabla |

La unica comparacion con datos verificables es contra el modelo base denso del que deriva. Cualquier comparacion con alternativas de otros tamanos requeriria reevaluar bajo el mismo protocolo FastEval de 50 muestras.

## Limitaciones y advertencias

- Modelo experimental y sin rodaje: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Evidencia estadistica muy debil: los benchmarks FastEval se calculan sobre 50 muestras por tarea, lo que implica que cada ejemplo vale 2 puntos porcentuales y que las diferencias de +2,0 puntos (MMLU-Pro, 4/50 frente a 5/50) no son significativas.
- Degradacion en modelado de lenguaje: la perplejidad empeora de 15,22 a 19,32 y la entropia cruzada de 2,7227 a 2,9609, lo que indica que la mejora en eleccion multiple zero-shot no se traduce en una mejor distribucion general de lenguaje.
- Penalizacion de velocidad: el enrutamiento personalizado reduce el throughput aproximadamente un 36-43% frente al modelo denso equivalente sobre kernels CUDA estandar.
- Requiere codigo personalizado: la carga depende de `smollm2_flyffn_v2.py` y `biological_flyffn_v2.pt`, por lo que no funciona con un `from_pretrained` estandar ni con herramientas de inferencia convencionales sin adaptacion.
- No hay ajuste por instrucciones documentado (RLHF, DPO u otros): se comporta como un modelo base y no sigue ordenes de forma fiable.
- Riesgo de alucinacion alto en generacion de texto libre, propio de un modelo base de 135 M de parametros sin alineamiento.
- Cobertura idiomatica limitada a ingles y aleman; no se documenta soporte de castellano.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad. Los sesgos del corpus de preentrenamiento de SmolLM2 se heredan sin mitigacion conocida.
- Licencia Apache 2.0, permisiva para uso comercial, pero el uso en produccion esta desaconsejado por la falta de validacion, el requisito de codigo personalizado y la degradacion de perplejidad.
- El tag `text-generation-inference` y `endpoints_compatible` no garantiza compatibilidad real de despliegue dado el requisito de capas personalizadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vtava/SmolLM2-135M-FlyFFN-v2
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Repositorio de codigo fuente (TinyCeNN-LM): https://github.com/vtavakkoli/TinyCeNN-LM
- Artefactos de evaluacion citados en la model card: `fast_eval_50.csv`, `fast_eval_50.json`
- Checkpoint original citado en la model card: `biological_flyffn_v2.pt`
- Script de definicion de capa citado en la model card: `smollm2_flyffn_v2.py`
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces utiles son los anteriores, procedentes del repositorio de HuggingFace y de la propia model card.
