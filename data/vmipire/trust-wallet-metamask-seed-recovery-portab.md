# vmipire/trust-wallet-metamask-seed-recovery-portab

## Resumen

El repositorio `vmipire/trust-wallet-metamask-seed-recovery-portab` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete de software para Windows presentado como herramienta de recuperación de frases semilla (seed phrases) de carteras de criptomonedas Trust Wallet y MetaMask, empaquetado como ejecutable portable de 64 bits. El autor es el usuario `vmipire` y la licencia declarada es MIT.

La ficha del repositorio describe capacidades de auditoría de tokens ERC20/SPL, parseo de keystores LevelDB, resolución parcial de mnemónicos BIP39 y exportación de balances, con un binario de nombre `marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe` distribuido a través de enlaces externos a GitHub y protegido con contraseña de archivo. Esta discrepancia entre el propósito declarado (recuperación de semillas) y el nombre del ejecutable (un supuesto cheat para un videojuego) es una señal de alarma clara.

No existe información sobre arquitectura de red neuronal, parámetros, contexto, datos de entrenamiento ni benchmarks. Cualquier evaluación como modelo de IA es, por tanto, inaplicable. Lo relevante para desarrolladores e investigadores es identificar el repositorio como no relacionado con IA y tratar su contenido como potencialmente malicioso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como archivo ZIP con ejecutable .exe para Windows x64) |

## Arquitectura y entrenamiento

No aplica. El repositorio no describe ninguna arquitectura de red neuronal ni proceso de entrenamiento. La model card enumera funcionalidades de un programa de escritorio (parseo de LevelDB, validación BIP39, hashing PBKDF2, motor SIMD multinúcleo con 8 hilos) que corresponden a una utilidad nativa de Windows, no a un modelo entrenado.

No hay información sobre conjuntos de datos, tokens de entrenamiento, RLHF, DPO ni innovaciones en atención o decodificación. El contenido del repositorio es ajeno al ámbito de los modelos de lenguaje.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- La model card declara funcionalidades de utilidad de escritorio para Windows: auditoría de tokens ERC20/SPL, parseo de keystores LevelDB, resolución parcial de mnemónicos BIP39, validación local de entropía y checksum de 12/18/24 palabras, y exportación de balances a informes locales.
- No hay soporte de tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de un LLM.
- Las etiquetas multilingües del repositorio no implican capacidades lingüísticas de un modelo; probablemente describen la interfaz del programa.
- El ejecutable distribuido se presenta con un nombre ajeno al propósito declarado (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`), lo que contradice las capacidades anunciadas.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, porque no lo es. Los escenarios que la model card sugiere (recuperación de semillas, auditoría de balances) no son verificables y entrañan riesgos graves:

- Recuperación de frases semilla: la propuesta de reconstruir palabras perdidas de una seed phrase BIP39 implicaría manejar material criptográfico sensible; ejecutar software de origen no verificado para ello expone las claves a robo.
- Auditoría de balances de carteras: requeriría acceso a keystores y datos locales de la víctima; no hay evidencia de que el binario realice esta función.
- Parseo de keystores LevelDB de extensiones de navegador: implicaría leer almacenamiento local de MetaMask o Trust Wallet, un vector clásico de exfiltración de credenciales.
- Validación BIP39 offline: técnicamente posible con bibliotecas auditadas, pero no justifica descargar un ejecutable de un repositorio sin trazabilidad.
- Exportación de informes de balances: sin verificación del binario, no es un caso de uso recomendable en ningún entorno.
- Integración en pipelines de desarrollo: inaplicable; no hay API, SDK ni pesos que integrar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye cifras de latencia propias de una utilidad de escritorio (respuesta en menos de 13 ms para el solucionador de mnemónicos, menos de 26 ms para la exportación de balances, sondeo a 216 Hz, 8 hilos de trabajo), pero no son comparables con métricas de modelos de IA y no están verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados: Windows 10 o Windows 11 de 64 bits, sin dependencias externas según el autor, con un paquete de 4,8 MB.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: las cifras de la model card no son verificables ni relevantes para inferencia de IA.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. Como utilidad de escritorio, tampoco se compara con herramientas auditadas de gestión de carteras (por ejemplo, bibliotecas BIP39 de referencia o clientes oficiales de Trust Wallet y MetaMask), que son de código abierto verificable y no se distribuyen como ejecutables ofuscados con contraseña.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal.
- Señales de riesgo elevadas: el ejecutable se llama como un cheat de videojuego, se distribuye fuera de Hugging Face mediante enlaces a GitHub de terceros, requiere contraseña de archivo (`2026`) y pide ejecución como administrador. Este patrón es habitual en campañas de malware.
- La model card incluye instrucciones para desactivar advertencias de Windows Defender o SmartScreen, lo que agrava el riesgo.
- Manipula material sensible por diseño (frases semilla, keystores, claves privadas); ejecutarlo puede provocar el robo irreversible de fondos.
- Cero descargas y cero likes en el momento de la consulta, sin historial ni reputación verificable.
- La licencia MIT declarada no otorga ninguna garantía sobre el binario ni sobre su seguridad.
- Riesgo de suplantación de marca: el uso de los nombres Trust Wallet y MetaMask no implica afiliación con sus desarrolladores.
- Recomendación: no descargar ni ejecutar el contenido del repositorio; reportarlo a Hugging Face si se confirma que infringe sus políticas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vmipire/trust-wallet-metamask-seed-recovery-portab
- Enlace de descarga citado en la model card (GitHub, no verificado): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub, no verificado): https://github.com/berkm24/trust-wallet-metamask-seed-recovery-portable/releases/latest
- Paper, blog, demo o repositorio oficial: no disponible
