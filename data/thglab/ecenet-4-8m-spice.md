# THGLab/ECENet-4.8M-SPICE

## Resumen

ECENet-4.8M-SPICE es un potencial interatómico de aprendizaje automático (machine-learning potential) desarrollado por THGLab, el grupo de Teresa Head-Gordon. No es un modelo de lenguaje: es una red neuronal equivariante que predice energías y fuerzas de sistemas moleculares, con 4.826.077 parámetros, un radio de corte de 5,0 Å y un checkpoint de PyTorch pensado para usarse como calculadora de ASE en simulaciones de dinámica molecular.

La arquitectura es una red de grafo de líneas (line-graph) O(2)-equivariante en la que las características viajan por las aristas del grafo atómico, expresadas en un sistema de referencia alineado con cada arista, y los mensajes se propagan entre aristas que comparten un átomo. El checkpoint incorpora suma de Ewald latente (latent Ewald summation, LES) para la electrostática de largo alcance, y predice además cargas atómicas latentes y dipolos de enlace, de los que se derivan dipolos moleculares y cargas efectivas de Born sin haber sido entrenado explícitamente en cargas.

Su relevancia para la química computacional está en combinar un tamaño reducido (unos 19,3 MB en float32) con modelado explícito de largo alcance y salidas electrostáticas derivadas. Está entrenado sobre el split MACE-OFF23 de SPICE v1 (900.000 estructuras de entrenamiento, 51.005 de validación y 50.195 de test) y se publica bajo licencia UC Regents.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafo de líneas (line-graph) O(2)-equivariante; "Edge Cluster Expansion Line Graph Neural Network" |
| Parametros totales | 4.826.077 |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); el equivalente espacial es un radio de corte de 5,0 Å para aristas y bases atómicas |
| Tipos de cuantizacion | No disponible (el checkpoint se entrena en float32, TF32 y después float32 puro; no se documentan cuantizaciones) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje); cubre los elementos H, C, N, O, F, P, S, Cl, Br e I |
| Licencia | UC Regents (license_name: uc-regents; texto en el archivo LICENSE) |
| Formato de pesos | Checkpoint de PyTorch con extensión .mdl, cargado con ecenet.calculator.load_calculator; no se documentan safetensors, GGUF ni otros formatos |
| Elementos cubiertos | H, C, N, O, F, P, S, Cl, Br, I (10 elementos) |
| Radio de corte | 5,0 Å (aristas y bases atómicas) |
| Truncamiento angular | ℓ_max = 3, m_max = 2 |
| Tamaño del repositorio | 0,0 GB según los metadatos de HuggingFace en el momento de la consulta |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

ECENet abandona el esquema habitual de mensajes entre nodos atómicos y traslada las características a las aristas del grafo atómico. Cada arista se representa en un sistema de referencia local alineado con ella, lo que da lugar a una equivariancia O(2) en lugar de la equivariancia SO(3) típica de otros potenciales. La base angular se trunca en ℓ_max = 3 y m_max = 2, con 16 funciones sinc como base radial y un cutoff de tipo coseno; cada par (ℓ, m) dispone de 42 canales, con un cuello de botella de 256 y 16 puntos de rejilla azimutal. El cuerpo de paso de mensajes consta de 3 capas de anchura 128 con 6 cabezas de gating, y la lectura final es un MLP invariante [512, 512] multiplicado por una base radial envuelta. La electrostática de largo alcance se resuelve con LES, que asigna a cada arista una carga latente y un dipolo de enlace (σ = 1,5 Å, escala 0,1). Las unidades de energía son eV, con referencias por elemento almacenadas en el propio checkpoint.

El entrenamiento parte del split MACE-OFF23 de SPICE v1, restringido a moléculas neutras de los diez elementos citados y con los pares iónicos eliminados: 900.000 estructuras de entrenamiento y 51.005 de validación procedentes del archivo de entrenamiento publicado, evaluadas sobre el conjunto de test estándar de 50.195 estructuras. La función de pérdida es Huber con δ = 0,0025, aplicada a energías por átomo (peso 10) y a componentes de fuerza (peso 0,5). Se optimiza con AdamW, tasa de aprendizaje 5×10⁻⁴ reducida a la mitad en siete hitos, durante 300 épocas con TF32 seguidas de 20 épocas en float32 puro, empleando 16 GPU A100. Los pesos publicados corresponden a la época con menor error de validación ponderado. El driver exacto es train.py en el repositorio de código.

## Capacidades

- Predicción de energías potenciales en eV, incluyendo el término de corto alcance y el de largo alcance resuelto con LES.
- Predicción de fuerzas atómicas en eV/Å.
- Predicción de cargas atómicas latentes (en unidades de carga elemental, con signo global arbitrario).
- Predicción de dipolos de enlace latentes por átomo (e·Å), accesibles como calc.results["les_dipoles"].
- Obtención de dipolos moleculares mediante Σ(qᵢ − q̄) rᵢ + Σ uᵢ, sin entrenamiento específico en cargas.
- Obtención de cargas efectivas de Born a lo largo de una trayectoria de dinámica molecular (opción --dump_bec).
- Soporte de sistemas periódicos mediante suma de Ewald para el término de largo alcance.
- Ejecución de dinámica molecular completa con salida de cargas y dipolos por fotograma (examples/run_md_xyz.py).
- Integración directa con ASE como calculadora (interfaz estándar de energía y fuerzas).
- Inferencia en CPU o GPU (device="cuda" en load_calculator).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento: no es un modelo generativo de lenguaje.

## Casos de uso

- Dinámica molecular de moléculas orgánicas y biomoléculas neutras: cargando el checkpoint con load_calculator y usando examples/run_md_xyz.py se obtienen trayectorias con energías en eV y fuerzas en eV/Å, aprovechando el radio de corte de 5,0 Å y el término de largo alcance.
- Optimización de geometrías y cribado conformacional: al ser un potencial diferenciable de 4,8 M de parámetros, permite relajar estructuras y comparar energías relativas de confórmeros en flujos de química computacional.
- Cálculo de propiedades electrostáticas derivadas: los dipolos moleculares y las cargas efectivas de Born se obtienen de las cargas y dipolos latentes sin reentrenamiento, lo que resulta útil para análisis de espectroscopía vibracional e IR.
- Simulación de sistemas periódicos: el uso de suma de Ewald para el término de largo alcance permite tratar líquidos y sólidos moleculares con condiciones de contorno periódicas.
- Estudio de estructura de agua líquida y espectros IR: la model card indica que el paper demuestra este comportamiento en fase condensada, aunque no formara parte del entrenamiento; sirve como punto de partida que debe validarse experimentalmente.
- Generación de datos para destilación o entrenamiento: el modelo puede etiquetar grandes conjuntos de geometrías con energías y fuerzas para alimentar modelos más rápidos o de menor coste.
- Acoplamiento a pipelines existentes de química computacional: la interfaz de calculadora de ASE permite insertarlo en optimizadores, esquemas de muestreo y herramientas de análisis sin reescribir código.
- Ajuste fino con datos propios: el repositorio incluye train.py y la instalación con el extra [les], de modo que se puede reentrenar el modelo sobre un dominio específico dentro de los diez elementos soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de evaluación (conjunto de test estándar de 50.195 estructuras del split MACE-OFF23 de SPICE v1, pérdida Huber sobre energías por átomo y fuerzas) y el número de épocas, pero no incluye valores numéricos de error (MAE de energía o de fuerzas) ni comparaciones cuantitativas con otros potenciales.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada. El checkpoint ocupa aproximadamente 19,3 MB en float32 (4.826.077 parámetros × 4 bytes), por lo que el consumo de memoria vendrá determinado por el número de átomos del sistema, el tamaño de lote y las estructuras intermedias del grafo, no por el propio modelo.
- GPU recomendadas: no se especifican. El entrenamiento se realizó con 16 GPU A100, pero la inferencia de un modelo de 4,8 M de parámetros es muy inferior en coste.
- GPU de consumo: cualquier GPU con soporte CUDA debería ser suficiente, dado el tamaño del checkpoint; también es viable la inferencia en CPU a través de PyTorch, con la lógica de dispositivo seleccionable mediante device="cuda".
- Opciones de despliegue: paquete Python ecenet instalado con pip install -e ".[les]" junto con ASE y PyTorch. No aplica el despliegue con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Alcance | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ECENet-4.8M-SPICE | 4.826.077 | Cutoff de 5,0 Å; largo alcance con LES; 10 elementos | No disponible | UC Regents | HuggingFace y GitHub; 0 descargas al consultar |
| MACE-OFF23 (familia MACE) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Otros potenciales interatómicos equivariantes (NequIP, Allegro, SO3LR) | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card no incluye comparativas numéricas frente a alternativas. La única relación documentada es que el entrenamiento parte del split MACE-OFF23 de SPICE v1, lo que convierte a la familia MACE-OFF23 en la referencia natural, pero no se aportan datos de parámetros, contexto de corte, errores ni licencia de esos modelos en la información disponible.

## Limitaciones y advertencias

- Solo sistemas neutros: los pares iónicos se eliminaron del conjunto de entrenamiento, por lo que no cabe esperar un comportamiento fiable en especies cargadas.
- Dominio químico restringido: únicamente cubre H, C, N, O, F, P, S, Cl, Br e I, y está pensado para sistemas orgánicos y biomoleculares.
- Sesgo de dominio en los datos: el entrenamiento usó moléculas aisladas y clústeres pequeños. El comportamiento en fase condensada (estructura del agua líquida y espectro IR) se demuestra en el paper, pero no formó parte del entrenamiento.
- Ambigüedad de signo en las cargas latentes: la energía de largo alcance es cuadrática en las cargas, de modo que su signo global no queda fijado por el entrenamiento. Es consistente dentro del checkpoint, pero no está anclado físicamente, y los dipolos moleculares son significativos solo salvo ese signo.
- Riesgo de extrapolación: como todo potencial de aprendizaje automático, fuera de la distribución de entrenamiento (geometrías muy distorsionadas, elementos no vistos) las predicciones no son fiables y no se documenta ningún mecanismo de estimación de incertidumbre.
- Sin benchmarks publicados en la información disponible, no es posible cuantificar su precisión frente a alternativas antes de adoptarlo en producción.
- Licencia UC Regents: la model card remite al archivo LICENSE y no detalla las condiciones de uso comercial, por lo que hay que revisarlo antes de cualquier despliegue en producción.
- Dependencia del paquete les: este checkpoint requiere el extra [les] de ECENet; sin él, el cálculo de largo alcance no está disponible.
- Estado del repositorio: los metadatos muestran 0 descargas, 0 likes y un tamaño de repositorio de 0,0 GB en el momento de la consulta, lo que sugiere que los pesos podrían no estar accesibles o no contabilizarse; conviene verificarlo antes de depender de este checkpoint.
- No se documentan análisis de sesgo en el sentido habitual de los modelos de lenguaje, porque no es un modelo de lenguaje; el sesgo relevante es el de cobertura del dominio químico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/THGLab/ECENet-4.8M-SPICE
- Código y driver de entrenamiento: https://github.com/THGLab/ECEnet
- Referencia del paper: A. LaCour y T. Head-Gordon, "ECENet: An Edge Cluster Expansion Line Graph Neural Network" (en preparación; no se proporciona enlace).
- Licencia: archivo LICENSE del repositorio del modelo (license_link: LICENSE).
- Ejemplo de dinámica molecular con cargas y cargas efectivas de Born: examples/run_md_xyz.py en el repositorio de código.
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Los resultados devueltos corresponden a páginas de soporte de Microsoft (contacto, inicio de sesión en Hotmail, actualizaciones de Exchange Server y Windows 11) y no guardan relación con ECENet ni con potenciales interatómicos.
