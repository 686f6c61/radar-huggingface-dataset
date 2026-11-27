# yumakemore/DAWIN

## Resumen

DAWIN (Damped Atomic Wave Integration Neurons) es una primitiva neuronal continua en el tiempo, agnostica a la arquitectura, disenada para el aprendizaje espaciotemporal sobre datos muestreados de forma irregular. Ha sido propuesta por Byunggu Yu y Justin Kim (University of the District of Columbia) en el articulo arXiv:2611.30025 y publicada como paquete PyPI y repositorio en Hugging Face bajo licencia MIT. No es un modelo de lenguaje generativo, sino un componente (layer o neurona) que se puede integrar en MLPs, Transformers o GNN temporales.

El problema que resuelve es el de las series temporales con muestreo no uniforme: los modelos habituales (RNN, Transformers con posicional encoding, SSM discretos) requieren interpolacion o discretizacion a una rejilla fija, lo que introduce error. DAWIN modela el estado interno de cada neurona como un paquete de ondas espaciotemporales amortiguadas que evoluciona mediante una forma cerrada exponencial para cualquier intervalo de tiempo Δt ≥ 0, sin necesidad de interpolacion.

Su relevancia radica en tres propiedades tecnicas: evolucion exacta en forma cerrada (sin solvers ODE iterativos ni error de truncamiento por paso), formulacion como recurrencia asociativa monoidal que permite ejecucion paralela en O(log L) mediante un kernel Triton fusionado, y estabilidad BIBO uniforme demostrable. El checkpoint publicado (`dawin_oscillator.pt`) es un ejemplo de oscilador entrenado, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Primitiva neuronal continua en el tiempo basada en paquetes de ondas amortiguadas; integrable en MLP (`DAWINMLP`), Transformer (`DAWINTransformer`) y GNN temporal (`DAWINGNN`) |
| Parametros totales | No disponible (el checkpoint publicado es un ejemplo de oscilador; el tamano depende de la configuracion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (soporta secuencias de longitud L con ejecucion paralela O(log L); no se especifica un maximo) |
| Tipos de cuantizacion | No disponible (pesos PyTorch en punto flotante; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`dawin_oscillator.pt`, checkpoint con `config` y `model_state_dict`) |

## Arquitectura y entrenamiento

DAWIN define el estado interno de cada neurona como un paquete de ondas espaciotemporales amortiguadas que evoluciona segun un amortiguador exponencial en forma cerrada para intervalos arbitrarios Δt. En lugar de resolver una ODE paso a paso (lo que introduciria error de truncamiento dependiente del tamano de paso), aplica la solucion analitica exacta de la integracion armonica amortiguada. La propagacion del estado se formula como una recurrencia asociativa monoidal exacta, lo que permite escanear la secuencia en paralelo con complejidad O(log L) mediante un kernel Triton fusionado.

La primitiva es agnostica a la arquitectura: se ofrece como `DAWINLinear` (capa), `DAWINMLP`, `DAWINTransformer` y `DAWINGNN`. Garantiza estabilidad BIBO uniforme (γ_m > 0) e invarianza de fase de modulo unitario frente a outliers en la entrada espacial. El repositorio incluye una suite de benchmark de 11 tareas. No se detallan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se empleo RLHF/DPO (no aplica al ser una primitiva, no un LLM). El checkpoint `dawin_oscillator.pt` es un ejemplo entrenado de oscilador, no un modelo de proposito general.

## Capacidades

- Modelado de series temporales con muestreo irregular sin interpolacion ni rejilla fija.
- Propagacion de estado continuo en el tiempo para intervalos Δt ≥ 0 arbitrarios.
- Integracion como capa en MLPs, Transformers y GNN temporales (arquitectura agnostica).
- Ejecucion paralela sobre la dimension temporal mediante associative scan y kernel Triton.
- Estabilidad BIBO uniforme demostrable e invarianza de fase ante outliers espaciales.
- Salida de cuadraturas real/imaginaria emparejadas de forma (B, L, 2·num_waves).
- No soporta tool calling, function calling, agentes, vision, audio ni capacidades multilingues (no es un modelo linguistico).

## Casos de uso

- Prediccion de series temporales con muestreo irregular: sensores IoT o telemetria que emiten a intervalos no uniformes; DAWIN procesa los Δt reales sin interpolar, evitando el sesgo que introduciria un remuestreo a rejilla fija.
- Modelado de datos clinicos con visitas irregulares: registros de pacientes con marcas temporales heterogeneas; la evolucion en forma cerrada permite propagar el estado entre visitas sin asumir periodicidad.
- Trafico y movilidad espaciotemporal: integracion en `DAWINGNN` para grafos temporales con nodos y aristas muestreados de forma irregular (por ejemplo, sensores de trafico con caidas).
- Datos financieros de alta frecuencia con ticks irregulares: uso de `DAWINLinear` como capa dentro de un modelo de forecasting para capturar dinamica continua entre operaciones.
- Simulacion y modelado fisico de osciladores: el checkpoint `dawin_oscillator.pt` sirve como ejemplo para ajustar dinamicas amortiguadas (muelles, circuitos, sistemas mecanicos) con intervalos de integracion arbitrarios.
- Investigacion en arquitecturas SSM continuas: uso como primitiva de referencia para comparar con SSM discretos (Mamba, S4) en tareas con Δt no uniforme, aprovechando la suite de 11 tareas del repositorio.
- Prototipado rapido via `pip install dawin`: integracion en pipelines PyTorch existentes como capa drop-in para experimentar con aprendizaje continuo en el tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona una suite de 11 tareas de benchmark, pero no se incluyen cifras numericas en la model card ni en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la configuracion (`in_features`, `num_waves`, profundidad). El checkpoint de ejemplo es pequeno y cabe en CPU.
- GPU recomendadas: no se especifican; el kernel Triton fusionado se beneficia de GPU NVIDIA (A100, H100, RTX 4090, etc.) para aprovechar el scan paralelo, pero el codigo es PyTorch estandar y funciona en CPU.
- Cabe en GPU consumer: si, para configuraciones moderadas; el checkpoint `dawin_oscillator.pt` se carga con `map_location="cpu"`.
- Opciones de despliegue: PyTorch nativo (`pip install dawin`), Google Colab (notebook quickstart), integracion en pipelines propios. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo generativo).
- Latencia y throughput: no disponibles; el paper alega ejecucion paralela O(log L) frente a O(L) secuencial, pero no se proporcionan cifras absolutas.

## Comparativa con modelos similares

| Modelo | Tipo | Tiempo irregular nativo | Paralelismo secuencial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DAWIN | Primitiva neuronal continua (SSM-like) | Si (forma cerrada para Δt arbitrario) | O(log L) via associative scan | MIT | PyPI + HF + GitHub |
| Mamba / S4 | SSM discretos | No (requieren discretizacion a rejilla) | O(L) secuencial / selectivo | Apache 2.0 (Mamba) | HF, GitHub |
| Neural ODE | ODE continua | Si, via solver numerico | No (solver iterativo) | MIT (referencia) | GitHub |
| Transformers con pos encoding | Atencion | No (posiciones fijas o relativas discretas) | O(L^2) atencion | Variable | Amplia |

No se dispone de comparativas cuantitativas de rendimiento entre DAWIN y estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni generativo: no soporta texto, codigo, vision ni audio; su ambito es exclusivamente el modelado espaciotemporal.
- El checkpoint publicado (`dawin_oscillator.pt`) es un ejemplo de oscilador, no un modelo listo para produccion en tareas generales.
- No se documentan sesgos, pero al ser una primitiva matematica, los sesgos dependeran de los datos de entrenamiento del modelo que la integre.
- Riesgo de alucinacion: no aplica directamente (no genera texto); el riesgo es de extrapolacion incorrecta en regimenes fuera de la distribucion de entrenamiento.
- No se especifican limitaciones de contexto maximo ni de idioma (no aplica).
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion; sin restricciones adicionales conocidas.
- Dependencia de un kernel Triton para el maximo rendimiento; en entornos sin Triton o sin GPU NVIDIA el rendimiento puede degradarse al camino PyTorch estandar.
- Novedad del trabajo (arXiv 2026) y bajo numero de descargas (0): ecosistema y validacion externa limitados.

## Enlaces

- Hugging Face: https://huggingface.co/yumakemore/DAWIN
- Paper arXiv: https://arxiv.org/abs/2611.30025
- Repositorio GitHub: https://github.com/yumakemore/DAWIN
- Paquete PyPI: https://pypi.org/project/dawin/
- Quickstart en Colab: https://colab.research.google.com/github/yumakemore/DAWIN/blob/main/DAWIN_Quickstart.ipynb
- Archivo software (Zenodo): https://doi.org/10.5281/zenodo.24485896
- DOI del paper: https://doi.org/10.48550/arXiv.2611.30025
