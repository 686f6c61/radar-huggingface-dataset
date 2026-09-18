# THGLab/ECENet-1.7M-SPICE

## Resumen

ECENet-1.7M-SPICE es un potencial interatomico de aprendizaje automatico (machine-learning interatomic potential) desarrollado por THGLab para simulacion de dinamica molecular. Se trata de una red neuronal de grafo de lineas (line-graph) con equivariancia O(2), en la que las caracteristicas se asignan a las aristas del grafo atomico y los mensajes se transmiten entre aristas a traves de los atomos compartidos. Predice energias, fuerzas, cargas atomicas latentes y dipolos de enlace, incorporando suma de Ewald latente (LES) para modelar la electrostatica de largo alcance.

El checkpoint corresponde al modelo pequeno y rapido de los dos entrenados sobre la particion MACE-OFF de SPICE, con 1.671.237 parametros y un cutoff espacial de 5,0 A. Cubre diez elementos (H, C, N, O, F, P, S, Cl, Br, I) y esta pensado para sistemas organicos y biomoleculares neutros. Es relevante porque ofrece un potencial de precision cercana a la fisica cuantica con un coste computacional muy inferior, lo que permite simular moleculas y clusters con fidelidad de DFT a una fraccion del coste.

Se distribuye bajo licencia UC Regents y depende del paquete opcional `les` para el calculo de largo alcance. Existe una variante mas precisa, ECENet-4.8M, para los casos en que prime la exactitud sobre la velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafo de lineas (line-graph) con equivariancia O(2); las features residen en las aristas y los mensajes se propagan entre aristas a traves de los atomos compartidos; suma de Ewald latente (LES) para largo alcance |
| Parametros totales | 1.671.237 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; emplea un cutoff espacial de 5,0 A para aristas y bases atomicas) |
| Tipos de cuantizacion | no disponible (entrenado en float32; no se documentan esquemas de cuantizacion) |
| Idiomas soportados | no aplica (modelo de potencial interatomico; no procesa lenguaje natural) |
| Licencia | UC Regents (license: other; license_name: uc-regents) |
| Formato de pesos | checkpoint `.mdl` cargado mediante `load_calculator` de ECENet (implementacion en PyTorch); el repositorio ocupa 0,0 GB |

Detalles adicionales de configuracion: truncamiento angular con l_max = 3 y m_max = 2; base radial de 16 funciones sinc con cutoff coseno; 24 canales por par (l, m); cuello de botella de 256 y 10 puntos de rejilla azimutal; una capa de message passing de anchura 64 y 8 cabezas de gating; read-out mediante MLP invariante de [512, 512] multiplicado por base radial con envolvente; largo alcance LES con cargas latentes y dipolos de enlace por arista, sigma = 1,5 A y escala 0,1; precision float32 (primero TF32, luego float32 puro); energias en eV con referencias por elemento almacenadas en el checkpoint.

## Arquitectura y entrenamiento

ECENet emplea una formulacion de grafo de lineas: en lugar de colocar las features en los nodos atomicos, las situa en las aristas (enlaces) y las expresa en un sistema de referencia alineado con cada arista. La propagacion de mensajes se realiza entre aristas que comparten un atomo, lo que permite construir de forma natural terminos de muchos cuerpos. La simetria es O(2)-equivalente (rotaciones alrededor del eje del enlace y reflexiones), y el modelo incorpora un modulo de largo alcance basado en LES que anade cargas latentes y dipolos de enlace por arista y utiliza suma de Ewald para sistemas periodicos. La configuracion es deliberadamente compacta: una sola capa de message passing y 1,67 millones de parametros.

El entrenamiento parte de la particion MACE-OFF23 de SPICE v1 (moleculas neutras de los diez elementos, con pares ionicos eliminados): 900.000 estructuras de entrenamiento y 51.005 de validacion extraidas del fichero de entrenamiento liberado, evaluadas sobre el conjunto de test estandar de 50.195 estructuras. Se optimizo con perdida de Huber (delta = 0,0025) sobre energias por atomo (peso 10) y componentes de fuerza (peso 0,5), con AdamW a tasa de aprendizaje 5x10^-4 reducida a la mitad en seis hitos, durante 200 epocas en TF32 seguidas de 20 epocas en float32 completo, empleando 16 GPU A100. Los pesos publicados corresponden a la epoca con menor error de validacion ponderado. El script de entrenamiento es `train.py` en el repositorio de codigo.

## Capacidades

- Prediccion de energias potenciales en eV para sistemas moleculares (componente de corto y largo alcance).
- Prediccion de fuerzas por atomo en eV/A.
- Prediccion de cargas atomicas latentes (en unidades de carga elemental; el signo global es arbitrario pero consistente dentro del checkpoint).
- Prediccion de dipolos de enlace latentes por atomo (en e·A).
- Calculo de cargas efectivas de Born a lo largo de trayectorias de dinamica molecular (mediante `--dump_bec` en los ejemplos del repositorio).
- Soporte de sistemas periodicos gracias a la suma de Ewald del termino de largo alcance.
- Integracion con ASE mediante un calculador dedicado (`ecenet.calculator.load_calculator`).
- Inferencia en CPU o GPU (parametro `device="cuda"`).
- Cobertura quimica limitada a diez elementos: H, C, N, O, F, P, S, Cl, Br, I.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni procesamiento de lenguaje: no es un modelo generativo de texto.

## Casos de uso

- Dinamica molecular de moleculas organicas: el modelo puede integrarse en ASE como calculador para propagar trayectorias con energias y fuerzas a coste muy inferior a DFT, adecuado para estudiar conformaciones y vibraciones de moleculas neutras de los diez elementos soportados.
- Simulacion de clusters moleculares pequenos: al haberse entrenado sobre moleculas aisladas y clusters pequenos, resulta apropiado para explorar agregados y complejos no covalentes dentro de su dominio de entrenamiento.
- Calculo de propiedades electrostaticas: la salida de cargas latentes y dipolos de enlace permite analizar distribuciones de carga y momentos dipolares a lo largo de una trayectoria.
- Calculo de cargas efectivas de Born: util para estudios de espectroscopia vibracional y respuesta dielectrica en fase gas, con volcado de BEC durante la simulacion.
- Cribado conformacional acelerado: la velocidad del modelo de 1,7 millones de parametros permite generar y relajar muchas conformaciones antes de refinar las mas prometedoras con DFT o con ECENet-4.8M.
- Sistemas periodicos de moleculas neutras: el termino LES con suma de Ewald permite tratar celdas periodicas de moleculas neutras, util en estudios de cristales moleculares donde no haya especies cargadas.
- Generacion de datos de referencia para entrenamiento: al producir energias y fuerzas de forma masiva, puede emplearse para preetiquetar conjuntos o como referencia destilada en pipelines de ML.
- Analisis de interacciones intramoleculares: la descomposicion en corto y largo alcance y los dipolos por enlace facilitan el estudio de enlaces de hidrogeno y efectos electrostaticos en moleculas organicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card describe los conjuntos de entrenamiento, validacion y test (900.000, 51.005 y 50.195 estructuras respectivamente) y la funcion de perdida empleada, pero no incluye valores finales de error (MAE de energia o fuerza) ni comparaciones cuantitativas con otros potenciales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 1.671.237 parametros en float32, el peso de los pesos ronda los 7 MB, por lo que la huella de memoria es minima y el cuello de botella sera el tama\u00f1o del sistema simulado, no el modelo.
- GPU recomendadas: no se especifican para inferencia. El entrenamiento se realizo con 16 GPU A100, pero la inferencia de un modelo de este tamano no requiere hardware de ese nivel.
- Compatibilidad con GPU de consumo: cabe con holgura en cualquier GPU de consumo moderna (RTX 3060, 4070, 4090, etc.), e incluso puede ejecutarse en CPU para sistemas pequenos.
- Opciones de despliegue: integracion con ASE a traves de `load_calculator`; requiere el paquete opcional `les` para este checkpoint. Dispositivo configurable con `device="cuda"`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Elementos | Largo alcance | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ECENet-1.7M-SPICE | 1.671.237 | H, C, N, O, F, P, S, Cl, Br, I | Si (LES + Ewald) | Menor (variante rapida) | UC Regents | HuggingFace (THGLab/ECENet-1.7M-SPICE) |
| ECENet-4.8M | no disponible (mayor que 1,7M) | no disponible (se presume el mismo conjunto) | Si (LES + Ewald) | Mayor (variante precisa) | UC Regents | Referenciado en la model card |
| MACE-OFF23 | no disponible | no disponible | no disponible | no disponible | no disponible | No disponible en la informacion proporcionada |

No se dispone de datos numericos que permitan comparar el rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Dominio quimico restringido a diez elementos (H, C, N, O, F, P, S, Cl, Br, I); su uso con otros elementos no es valido.
- Solo moleculas neutras: el entrenamiento excluyo los pares ionicos y no incluye especies cargadas, por lo que no debe emplearse con iones.
- La energia de largo alcance es cuadratica en las cargas latentes, de modo que el signo global de estas no queda determinado por el entrenamiento; es consistente dentro del checkpoint pero no esta fijado fisicamente.
- Entrenado sobre moleculas aisladas y clusters pequenos: no se contemplo el uso en fase condensada, lo que limita su aplicabilidad a sistemas densos o bulk sin validacion previa.
- Riesgo de extrapolacion fuera de la distribucion de entrenamiento (MACE-OFF23 de SPICE v1) en geometrias o composiciones no representadas.
- Licencia UC Regents con condiciones especificas recogidas en `LICENSE`; es una licencia de tipo `other`, no una licencia permisiva estandar, por lo que debe revisarse antes de cualquier uso comercial.
- No se documentan cuantizaciones ni versiones optimizadas, y el repositorio aparece con 0 descargas y 0 likes, lo que indica una adopcion practicamente nula y ausencia de validacion externa por la comunidad.
- Modelo no generativo: no admite instrucciones en lenguaje natural, tool calling ni tareas de texto.
- Los resultados de busqueda web proporcionados no guardan relacion con el modelo (corresponden a un abogado suizo homonimo), por lo que no aportan informacion tecnica adicional.

## Enlaces

- HuggingFace: https://huggingface.co/THGLab/ECENet-1.7M-SPICE
- Repositorio de codigo: https://github.com/THGLab/ECEnet
- Paper (en preparacion): *ECENet: An Edge Cluster Expansion Line Graph Neural Network*, A. LaCour y T. Head-Gordon.
- Ejemplo de dinamica molecular con cargas y BEC: `examples/run_md_xyz.py` en el repositorio de codigo (opciones `--dump_charges`, `--dump_bec`).
- Script de entrenamiento: `train.py` en el repositorio de codigo.
- No se han encontrado otros enlaces relevantes en la busqueda web.
