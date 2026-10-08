# zeechimp/HoloMind

## Resumen

HoloMind es un micro-modelo educativo publicado por el usuario zeechimp en HuggingFace que implementa un sustrato FHRR (Fourier Holographic Reduced Representation) con regiones tipadas. No se trata de una red neuronal entrenada: no tiene pesos, no tiene gradientes y no dispone de bucle de entrenamiento. Su proposito es exponer las operaciones primitivas (binding, unbinding, roles y valores) sobre las que podria construirse una memoria persistente para modelos de lenguaje, y reportar donde esas operaciones se sostienen y donde fallan.

El sustrato representa cada item como un vector complejo de dimensionalidad D = 2048. Hechos, episodios, asociaciones multimodales y secuencias conviven en el mismo codebook role/value. La recuperacion es algebraicamente un unbinding seguido de una clasificacion por vecino mas cercano. Las escrituras son aditivas, el borrado es sustractivo y la capacidad es medible a partir de la magnitud de la traza (|trace|).

Es relevante ahora porque propone un sustrato comun para varios tipos de memoria con cuatro afirmaciones novedosas: la brecha de capacidad entre lectura en una y dos etapas a D y K fijos, el binding dirigido mediante roll en frecuencia como solucion al ciclo-2 del binding conmutativo, |trace| como senal de confianza correlacionada con la precision medida y la ortogonalidad gratuita de roles a D constante. Es material de investigacion y docencia, no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FHRR (Fourier Holographic Reduced Representation), vector-symbolic architecture / hyperdimensional computing |
| Parametros totales | no aplica (no es una red neuronal; no tiene pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible; la dimensionalidad del sustrato es D = 2048 (no es una ventana de contexto secuencial) |
| Tipos de cuantizacion | no aplica (vectores complejos float, sin cuantizacion) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica (no hay pesos; el codigo es un unico `holomind.py` con dependencia exclusiva de NumPy) |

## Arquitectura y entrenamiento

El sustrato opera sobre vectores complejos de longitud D = 2048. Las operaciones basicas son: `bind(a, b) = ifft(fft(a) · fft(b))`, simetrica, y `bind_dir(a, b) = ifft(fft(a) · roll(fft(b), 1))`, no conmutativa. La version dirigida resuelve el fallo de ciclo-2 que produce el binding simetrico sobre secuencias. Existen dos tipos de regiones: regiones de items, definidas como `S = Σᵢ bind(itemᵢ, itemᵢ)`, donde la consulta hace unbinding de una clave parcial y lee los campos por unbinding de sus roles; y regiones de transicion, `S = Σᵢ bind_dir(sᵢ, sᵢ₊₁)`, que se recorren haciendo unbinding del estado actual. Los roles y valores se generan a partir de un hash estable y se comparten entre todas las regiones, lo que permite que un vector recuperado sea una clave valida en otra region.

No hay entrenamiento. El modelo card especifica explicitamente que no hay pesos, ni gradientes, ni optimizacion, ni bucle de entrenamiento, y que no pretende sustituir a la atencion ni a la KV cache, sino ser el sustrato sobre el que esos mecanismos podrian construirse. Los tres modos de fallo documentados (analogias sin rol de relacion explicito, binding anidado sin prefijo de rol y ciclo-2 en secuencias con binding simetrico) comparten una misma causa: la operacion no coincide con la estructura del contenido.

## Capacidades

- Extraccion de caracteristicas (pipeline declarado en HuggingFace: `feature-extraction`).
- Memoria asociativa: almacenamiento y recuperacion de pares clave-valor mediante unbinding algebraico y clasificacion por vecino mas cercano.
- Razonamiento multi-hop sobre el sustrato (por ejemplo, `france --capital_of--> paris --in_country--> france`), con similitudes del orden de 0.167.
- Modelado de secuencias dirigidas mediante `bind_dir`, con recorridos tipo `['wake', 'coffee', 'commute', 'work', 'lunch', 'work2']`.
- Asociaciones multimodales: un mismo concepto puede tener varias direcciones (por ejemplo, `img_0 -> cat`, `aud_1 -> dog`).
- Consultas entre regiones: los roles y valores compartidos permiten encadenar lecturas a traves de regiones distintas.
- Estimacion de confianza mediante la magnitud de la traza |trace|, que crece de forma monotona con la carga mientras la tasa de acierto decrece.
- Eviction reversible: el borrado sustractivo elimina una entrada sin afectar a las demas.
- No soporta tool calling ni function calling; no incorpora modo de thinking, vision ni audio como capacidades de inferencia, solo la posibilidad de codificar direcciones multimodales en el sustrato.

## Casos de uso

- Docencia de arquitecturas vector-symbolic: el script `holomind.py` se ejecuta en unos 4 segundos en un portatil con NumPy y permite ilustrar binding, unbinding y capacidad en el aula sin infraestructura.
- Prototipado de memoria persistente para LLM: sirve como banco de pruebas para explorar como enrutar hechos, episodios y asociaciones multimodales en un unico sustrato antes de comprometerse con una implementacion a escala.
- Investigacion en hyperdimensional computing: reproduce las tablas de capacidad a D = 2048 y permite comparar la lectura en una y dos etapas bajo la misma carga.
- Calibracion de senales de confianza: el uso de |trace| como estimador escalar de correccion es aplicable a sistemas que necesitan decidir cuando un recall es fiable sin ejecutar una verificacion costosa.
- Experimentos de secuencias dirigidas: `bind_dir` permite representar transiciones no conmutativas y evita el ciclo-2, util para modelar caminos y estados sin recurrir a atencion.
- Diseno de memorias multimodales: la propiedad de ortogonalidad gratuita de roles a D constante permite anadir modalidades (imagen, audio) sin reducir la capacidad de recuperacion, un punto de partida para arquitecturas de asociacion cross-modal.
- Evaluacion de modos de fallo: los tres fallos documentados con sus correcciones sirven como checklist de diseno para quien construya operaciones algebraicas sobre estructuras de contenido.

## Benchmarks y rendimiento

Los resultados siguientes estan extraidos del model card. Se obtuvieron con `holomind.py` a D = 2048, semilla 0, sobre CPU.

Simulaciones de recuperacion:

| Experimento | Ejemplo | Similitud |
|---|---|---|
| Hechos | capital of france -> paris | 0.181 |
| Hechos | capital of japan -> tokyo | 0.187 |
| Multi-hop | france --capital_of--> paris --in_country--> france | 0.167 |
| Multimodal | img_0 -> cat | 0.145 |
| Multimodal | aud_1 -> dog | 0.132 |
| Cross-region | capitals('france') -> paris | 0.214 |
| Cross-region | facts('paris', in_country) -> france | 0.167 |
| Cross-region | continents('france') -> europe | 0.282 |

Capacidad: lectura en una etapa frente a dos etapas a la misma carga.

| N | Una etapa | Dos etapas | \|trace\| |
|---|---|---|---|
| 10 | 1.00 | 0.90 | 3.2 |
| 20 | 1.00 | 1.00 | 4.5 |
| 40 | 1.00 | 0.55 | 6.3 |
| 60 | 0.95 | 0.47 | 8.0 |
| 80 | 0.95 | 0.26 | 8.9 |
| 120 | 0.66 | 0.23 | 11.3 |

Hallazgo declarado: la precision de recuperacion a carga K depende del numero de unbindings sucesivos en la ruta de consulta, no solo de K. Un unico unbind tolera K aproximado de 40 a 80 a D = 2048; cada unbind adicional en la cadena reduce aproximadamente a la mitad el techo de carga limpia.

Confianza: |trace| frente a correccion.

| Region | n | \|trace\| | Hit rate | Veredicto |
|---|---|---|---|---|
| load1_10 | 10 | 3.2 | 1.00 | confident |
| load1_40 | 40 | 6.3 | 1.00 | confident |
| load1_80 | 80 | 8.9 | 0.95 | confident |
| load1_120 | 120 | 11.3 | 0.66 | confident |

Hallazgo declarado: |trace| crece de forma monotona con la carga mientras la tasa de acierto cae, de modo que un umbral sobre |trace| constituye un estimador escalar barato de confianza. En esta ejecucion el clasificador de veredicto es deliberadamente tosco (umbrales en 0.20 y 0.25 de D); lo que se destaca es la forma de la senal.

Eviction (memoria aditiva reversible):

| Estado | Clave | Resultado | Similitud |
|---|---|---|---|
| Antes de evict | key = e_2 | e_2 | 0.224 |
| Tras evict | key = e_2 | e_3 | 0.020 (ruido esperado) |
| Tras evict | key = e_0 | e_0 | 0.232 (no afectada) |

No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks de modelos generativos, porque HoloMind no es un modelo generativo entrenado.

## Requisitos de hardware

- Inferencia en CPU: el script esta disenado para ejecutarse sobre NumPy, sin GPU. Tiempo de ejecucion esperado de aproximadamente 4 segundos en un portatil.
- VRAM: no aplica; no hay pesos que cargar ni inferencia en GPU.
- GPU recomendadas: ninguna. El model card indica explicitamente que el codigo usa bucles Python y no tiene batching, y sugiere vectorizar la ruta de FFT con `einsum` antes de usarlo a escala.
- Compatibilidad con GPU de consumo: no aplica, no es un modelo neuronal.
- Opciones de despliegue: no hay integraciones con vLLM, llama.cpp, Ollama ni TGI. El unico camino de ejecucion documentado es `python holomind.py`.
- Latencia y throughput: no disponibles mas alla de la referencia de tiempo de ejecucion en CPU.

## Comparativa con modelos similares

No disponible. HoloMind no es un modelo de lenguaje ni una red neuronal entrenada: carece de parametros, pesos y datos de entrenamiento, por lo que no es comparable en terminos de MMLU, contexto o generacion con modelos de embeddings, generativos o de recuperacion. Su comparacion natural seria con otras implementaciones de arquitecturas vector-symbolic o hyperdimensional computing, pero la informacion proporcionada no incluye referencias ni resultados de dichos sistemas, por lo que no se puede establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- No es un modelo entrenado: no tiene pesos, gradientes ni optimizacion, y no debe tratarse como un componente de inferencia neuronal.
- No es produccion: el model card advierte de bucles Python, ausencia de batching y D = 2048 fijado en la demo. Recomienda vectorizar la ruta de FFT con `einsum` antes de usarlo a escala.
- Idioma: los tags solo declaran ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion: no aplica en el sentido habitual de un LLM, pero la lectura por vecino mas cercano puede devolver una clave incorrecta cuando la carga supera el techo de la ruta de consulta (por ejemplo, hit rate de 0.66 a N = 120 con un unico unbind, y de 0.23 en dos etapas).
- La senal de confianza |trace| crece con la carga mientras la precision cae; en la propia ejecucion de referencia el veredicto se mantiene en "confident" incluso con hit rate de 0.66, por lo que los umbrales por defecto no son fiables sin recalibrar.
- Tres modos de fallo documentados: analogias sin rol de relacion explicito, binding anidado sin prefijo de rol y ciclo-2 en secuencias con binding simetrico. Todos requieren cambiar la operacion para que coincida con la estructura del contenido.
- Licencia apache-2.0: permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y conservacion de avisos.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existe evidencia de validacion externa ni de uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/zeechimp/HoloMind
- Companion paper citado en el model card: *Twelve experiments probing the holographic substrate* (no se proporciona enlace en la informacion disponible).
- Fichero de codigo `holomind.py` incluido en el repositorio de HuggingFace (no se proporciona URL directa en la informacion disponible).
- Citacion academica:
```
@misc{holomind2026,
  title  = {HoloMind: one holographic substrate, several memories},
  author = {zeechimp},
  year   = {2026},
  note   = {Educational micro-model}
}
```
